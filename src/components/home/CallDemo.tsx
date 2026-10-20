"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { demoCalls, type DemoCall } from "@/content/calls";
import { track } from "@/lib/analytics/track";
import { duration, ease, spring } from "@/lib/motion/tokens";

export const INDUSTRY_STORAGE_KEY = "cb_industry";

const SCENES: Record<DemoCall["id"], string> = {
  garage: "/scenes/garage.webp",
  clinic: "/scenes/clinic.webp",
  realestate: "/scenes/realestate.webp",
};

const SPEAK_MS = { bot: 650, caller: 500 } as const;
const READ_MS_PER_CHAR = 17;
const MIN_PAUSE_MS = 450;

type Phase = "speaking" | "idle";

function Wave({ tone }: { tone: "bot" | "caller" }) {
  return (
    <span className="flex h-4 items-center gap-0.5" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          className={`h-full w-0.5 origin-center animate-wave rounded-full ${tone === "bot" ? "bg-teal-300" : "bg-mist-300"}`}
          style={{ animationDelay: `${index * 110}ms` }}
        />
      ))}
    </span>
  );
}

function rememberIndustry(id: DemoCall["id"]) {
  try {
    window.sessionStorage.setItem(INDUSTRY_STORAGE_KEY, id);
  } catch {
    /* Storage blocked: the form simply starts without a preselected industry. */
  }
}

function subscribeToNothing() {
  return () => {};
}

/** `/?call=clinic#demo` opens a specific call, e.g. from the thank-you page. Only known ids are accepted. */
function readRequestedCall(): DemoCall["id"] | null {
  const requested = new URLSearchParams(window.location.search).get("call");
  return demoCalls.find((item) => item.id === requested)?.id ?? null;
}

export function CallDemo() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(panelRef, { amount: 0.25, once: true });

  const requestedId = useSyncExternalStore(subscribeToNothing, readRequestedCall, () => null);
  const [pickedId, setActiveId] = useState<DemoCall["id"] | null>(null);
  const activeId = pickedId ?? requestedId ?? "garage";
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [paused, setPaused] = useState(false);

  const call = demoCalls.find((item) => item.id === activeId) ?? demoCalls[0]!;
  const total = call.lines.length;
  const shown = reduce ? total : step;
  const done = shown >= total;
  const playing = !reduce && inView && !paused && !done;

  useEffect(() => {
    if (!playing) return;
    const next = call.lines[step];
    if (!next) return;

    if (phase === "idle") {
      const previous = call.lines[step - 1];
      const pause = previous ? Math.max(MIN_PAUSE_MS, previous.text.length * READ_MS_PER_CHAR) : 400;
      const timer = window.setTimeout(() => setPhase("speaking"), pause);
      return () => window.clearTimeout(timer);
    }

    const timer = window.setTimeout(() => {
      setPhase("idle");
      setStep((value) => value + 1);
    }, SPEAK_MS[next.speaker]);
    return () => window.clearTimeout(timer);
  }, [playing, phase, step, call]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    // Mobile: chat grows with the page — no nested scroll trap. Desktop: keep the panel scrolled to latest line.
    if (window.matchMedia("(max-width: 767px)").matches) return;
    container.scrollTo({ top: container.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [shown, phase, reduce]);

  const filled = useMemo(() => {
    const indexes = new Set<number>();
    call.lines.slice(0, shown).forEach((line) => line.fills?.forEach((index) => indexes.add(index)));
    return indexes;
  }, [call, shown]);

  const completedCalls = useRef(new Set<string>());
  useEffect(() => {
    if (!inView || !done || completedCalls.current.has(call.id)) return;
    completedCalls.current.add(call.id);
    track("demo_call_complete", { call: call.id });
  }, [inView, done, call.id]);

  const selectCall = (id: DemoCall["id"]) => {
    if (id !== activeId) track("demo_call_select", { call: id });
    setActiveId(id);
    setStep(0);
    setPhase("idle");
    setPaused(false);
    rememberIndustry(id);
  };

  const replay = () => {
    setStep(0);
    setPhase("idle");
    setPaused(false);
  };

  const speakingLine = phase === "speaking" && playing ? call.lines[step] : undefined;
  const seconds = Math.round(call.lines.slice(0, shown).reduce((sum, line) => sum + line.text.length * 0.07 + 1.2, 0));
  const clock = `00:${String(Math.min(seconds, 59)).padStart(2, "0")}`;

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="relative border-t border-night-800 bg-night-900/40 py-24 md:py-32"
      aria-labelledby="demo-title"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl" data-reveal>
            <p className="text-small font-medium text-teal-300">שיחה לדוגמה</p>
            <h2 id="demo-title" className="mt-4 text-h2 font-bold text-balance">
              ככה נראית שיחה כשלקוח מתקשר אחרי שסגרתם
            </h2>
            <p className="mt-5 text-lead text-mist-300">
              בחרו תחום. מימין השיחה, ומשמאל מה שנכנס למערכת שלכם תוך כדי.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="בחירת תחום לשיחה"
            className="flex w-full gap-2 overflow-x-auto overscroll-x-contain rounded-control border border-night-700 bg-night-950 p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {demoCalls.map((item) => {
              const active = item.id === activeId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls="demo-panel"
                  onClick={() => selectCall(item.id)}
                  className={`relative min-h-11 shrink-0 rounded-chip px-5 text-small font-medium transition-colors duration-100 ${
                    active ? "text-night-950" : "text-mist-300 hover:text-mist-100"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="demo-tab"
                      className="absolute inset-0 rounded-chip bg-teal-400"
                      transition={spring}
                    />
                  ) : null}
                  <span className="relative">{item.tab}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div ref={panelRef} id="demo-panel" role="tabpanel" className="mt-12 grid gap-6 lg:grid-cols-12">
          <div className="overflow-hidden rounded-panel border border-night-700 bg-night-950 shadow-panel lg:col-span-7">
            <div className="relative h-32 overflow-hidden md:h-40" aria-hidden="true">
              <AnimatePresence initial={false}>
                <motion.div
                  key={call.id}
                  className="absolute inset-0"
                  initial={reduce ? false : { opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Image src={SCENES[call.id]} alt="" fill sizes="(min-width: 1024px) 700px, 100vw" className="object-cover"
                    style={{ objectPosition: "30% 75%" }}
                  />
                </motion.div>
              </AnimatePresence>
              <div className="absolute inset-0 bg-linear-to-t from-night-950 via-night-950/40 to-transparent" />
              <span className="absolute end-3 top-3 rounded-chip bg-night-950/70 px-2 py-0.5 text-micro text-mist-400 backdrop-blur-sm">
                הדמיה
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-night-700 px-5 py-4">
              <div className="min-w-0">
                <p className="truncate text-small font-semibold text-mist-100">{call.business}</p>
                <p className="text-micro text-mist-400">
                  {call.when} · <bdi dir="ltr" className="font-latin tabular-nums">{call.time}</bdi> · נענתה על ידי CALLBOT
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span className="font-latin text-micro tabular-nums text-mist-400" dir="ltr">
                  {clock}
                </span>
                {!reduce ? (
                  done ? (
                    <button
                      type="button"
                      onClick={replay}
                      className="min-h-10 rounded-chip border border-night-600 px-3 text-micro font-medium text-mist-100 hover:bg-night-800"
                    >
                      להפעיל שוב
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPaused((value) => !value)}
                      aria-pressed={paused}
                      className="min-h-10 rounded-chip border border-night-600 px-3 text-micro font-medium text-mist-100 hover:bg-night-800"
                    >
                      {paused ? "להמשיך" : "לעצור"}
                    </button>
                  )
                ) : null}
              </div>
            </div>

            {/* Mobile: natural height so page scroll continues. md+: fixed panel with inner scroll. */}
            <div
              ref={scrollRef}
              className="px-4 py-5 touch-pan-y md:h-104 md:overflow-y-auto md:overscroll-y-contain md:px-6"
              aria-live="polite"
              data-lenis-prevent
            >
              <ol className="flex flex-col gap-3">
                <AnimatePresence initial={false}>
                  {call.lines.slice(0, shown).map((line, index) => (
                    <motion.li
                      key={`${call.id}-${index}`}
                      initial={reduce ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: duration.base, ease: ease.out }}
                      className={`flex ${line.speaker === "bot" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-5/6 rounded-card px-4 py-3 text-body ${
                          line.speaker === "bot"
                            ? "rounded-ss-chip bg-teal-400/10 text-mist-100 ring-1 ring-teal-400/20"
                            : "rounded-se-chip bg-night-800 text-mist-100"
                        }`}
                      >
                        <span className="mb-1 block text-micro font-semibold text-mist-400">
                          {line.speaker === "bot" ? "CALLBOT" : "הלקוח"}
                        </span>
                        {line.text}
                      </div>
                    </motion.li>
                  ))}
                  {speakingLine ? (
                    <motion.li
                      key={`${call.id}-speaking-${step}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: duration.instant } }}
                      className={`flex ${speakingLine.speaker === "bot" ? "justify-start" : "justify-end"}`}
                    >
                      <span
                        className={`inline-flex items-center gap-2 rounded-card px-4 py-3 text-micro text-mist-400 ${
                          speakingLine.speaker === "bot" ? "bg-teal-400/10" : "bg-night-800"
                        }`}
                      >
                        <Wave tone={speakingLine.speaker} />
                        {speakingLine.speaker === "bot" ? "CALLBOT מדבר" : "הלקוח מדבר"}
                      </span>
                    </motion.li>
                  ) : null}
                </AnimatePresence>
              </ol>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="rounded-panel border border-night-700 bg-night-900 p-5 md:p-6">
              <div className="flex items-center justify-between">
                <p className="text-small font-semibold text-mist-100">כרטיס ליד</p>
                <p className="text-micro text-mist-500">
                  מתמלא מתוך השיחה ·{" "}
                  <bdi dir="ltr" className="font-latin tabular-nums">
                    {filled.size}/{call.lead.length}
                  </bdi>
                </p>
              </div>
              <dl className="mt-4 flex flex-col">
                {call.lead.map((field, index) => {
                  const visible = filled.has(index);
                  return (
                    <div key={field.label} className="grid grid-cols-3 items-center gap-3 border-t border-night-700/70 py-3 first:border-t-0">
                      <dt className="text-small text-mist-500">{field.label}</dt>
                      <dd className="col-span-2 min-h-6 text-small text-mist-100">
                        <AnimatePresence mode="wait" initial={false}>
                          {visible ? (
                            <motion.span
                              key="value"
                              initial={reduce ? false : { opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: duration.base, ease: ease.out }}
                              className="block"
                            >
                              {field.ltr ? (
                                <bdi dir="ltr" className="font-latin tabular-nums">
                                  {field.value}
                                </bdi>
                              ) : (
                                field.value
                              )}
                            </motion.span>
                          ) : (
                            <motion.span key="empty" exit={{ opacity: 0 }} className="block h-2.5 w-2/3 rounded-full bg-night-700" />
                          )}
                        </AnimatePresence>
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>

            <div
              className={`flex items-center gap-3 rounded-card border px-5 py-4 transition-colors duration-500 ${
                done ? "border-teal-400/40 bg-teal-400/10" : "border-night-700 bg-night-900"
              }`}
            >
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full transition-colors duration-500 ${
                  done ? "bg-teal-400 text-night-950" : "bg-night-700 text-mist-500"
                }`}
                aria-hidden="true"
              >
                <svg viewBox="0 0 20 20" className="size-4">
                  <path d="m5 10.5 3.2 3L15 6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <p className="text-small text-mist-300">
                {done ? (
                  <>
                    הכרטיס נכנס ל-<bdi dir="ltr" className="font-semibold text-mist-100">{call.destination}</bdi>. מחר בבוקר הוא
                    מחכה לכם שם.
                  </>
                ) : (
                  <>
                    בסוף השיחה הכרטיס נשלח ל-<bdi dir="ltr">{call.destination}</bdi>
                  </>
                )}
              </p>
            </div>
            <p className="text-micro text-mist-500">תסריט הדגמה. שמות העסקים והלקוחות בדויים. בדמו תשמעו את הבוט עצמו.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
