"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { roadmap } from "@/content/home";
import { loadGsap } from "@/lib/motion/gsap";
import { duration, ease, stagger } from "@/lib/motion/tokens";

type Point = readonly [number, number];
type Track = {
  viewBox: string;
  start: Point;
  segments: readonly string[];
  nodes: readonly Point[];
  stroke: number;
  nodeScale: number;
  id: string;
};

/** The track runs right-to-left on desktop, matching Hebrew reading order. */
const DESKTOP: Track = {
  viewBox: "0 0 1200 380",
  start: [1120, 260],
  segments: ["C 980 260 930 110 790 110", "C 650 110 560 260 420 260", "C 280 260 220 110 80 110"],
  nodes: [
    [1120, 260],
    [790, 110],
    [420, 260],
    [80, 110],
  ],
  stroke: 22,
  nodeScale: 1,
  id: "desktop",
};

const MOBILE: Track = {
  viewBox: "0 0 360 620",
  start: [250, 60],
  segments: ["C 250 150 110 140 110 230", "C 110 320 250 310 250 400", "C 250 490 110 480 110 560"],
  nodes: [
    [250, 60],
    [110, 230],
    [250, 400],
    [110, 560],
  ],
  stroke: 24,
  nodeScale: 1.05,
  id: "mobile",
};

/** Desktop labels sit under the node; on the narrow mobile track they sit beside it, away from the path. */
function labelPosition(track: Track, x: number): { x: number; y: number } {
  if (track.id === "desktop") return { x: 0, y: 64 };
  return { x: x > 180 ? -92 : 92, y: 5 };
}

const pathData = (track: Track, segmentCount = track.segments.length) =>
  `M ${track.start[0]} ${track.start[1]} ${track.segments.slice(0, segmentCount).join(" ")}`;

/** Position of each node along the path as a 0..1 fraction of its total length. */
function nodeFractions(svg: SVGSVGElement, track: Track): number[] {
  const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
  probe.setAttribute("fill", "none");
  probe.setAttribute("visibility", "hidden");
  svg.appendChild(probe);
  const lengths = track.nodes.map((_, index) => {
    if (index === 0) return 0;
    probe.setAttribute("d", pathData(track, index));
    return probe.getTotalLength();
  });
  probe.remove();
  const total = lengths[lengths.length - 1] || 1;
  return lengths.map((length) => length / total);
}

const FILL_END = 0.9;
const SKY = [
  "bg-linear-to-b from-violet-700/35 via-night-950 to-night-950",
  "bg-linear-to-b from-night-800/70 via-night-950 to-night-950",
  "bg-linear-to-b from-night-900 via-night-950 to-night-950",
  "bg-linear-to-t from-teal-600/25 via-night-950/40 to-night-950",
] as const;

function TrackSvg({ track, active, className }: { track: Track; active: number; className: string }) {
  const d = pathData(track);
  return (
    <svg viewBox={track.viewBox} className={className} aria-hidden="true" data-track>
      <defs>
        <filter id={`glow-${track.id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>
      <path d={d} fill="none" stroke="var(--color-night-700)" strokeWidth={track.stroke} strokeLinecap="round" />
      {track.id === "desktop" ? (
        <path
          d={d}
          fill="none"
          stroke="var(--color-teal-400)"
          strokeWidth={track.stroke + 10}
          strokeLinecap="round"
          opacity="0.45"
          filter={`url(#glow-${track.id})`}
          data-fill
        />
      ) : null}
      <path d={d} fill="none" stroke="var(--color-teal-400)" strokeWidth={track.stroke} strokeLinecap="round" data-fill />
      <path d={d} fill="none" stroke="var(--color-teal-300)" strokeWidth={2} strokeLinecap="round" opacity="0.7" data-fill />

      {track.nodes.map(([x, y], index) => {
        const state = index < active ? "done" : index === active ? "active" : "idle";
        const stage = roadmap.stages[index]!;
        const label = labelPosition(track, x);
        return (
          <g key={stage.time} transform={`translate(${x} ${y}) scale(${track.nodeScale})`}>
            <circle
              r="62"
              fill="var(--color-teal-400)"
              filter={`url(#glow-${track.id})`}
              className="transition-opacity duration-500"
              opacity={state === "active" ? 0.32 : 0}
            />
            <g className="roadmap-node" data-state={state}>
              <rect x="-36" y="-36" width="72" height="72" rx="22" fill="var(--color-night-950)" />
              <rect
                x="-36"
                y="-36"
                width="72"
                height="72"
                rx="22"
                className="transition-colors duration-300"
                fill={state === "idle" ? "rgb(255 255 255 / 0.035)" : state === "active" ? "rgb(78 205 196 / 0.16)" : "rgb(78 205 196 / 0.07)"}
                stroke={state === "idle" ? "var(--color-night-600)" : "var(--color-teal-400)"}
                strokeWidth="1.5"
              />
              <rect x="-35" y="-35" width="70" height="35" rx="21" fill="rgb(255 255 255 / 0.04)" />
              <text
                y="6"
                textAnchor="middle"
                className="font-latin"
                fontSize="17"
                fontWeight="700"
                fill={state === "idle" ? "var(--color-mist-500)" : "var(--color-mist-100)"}
              >
                {stage.time}
              </text>
            </g>
            <text
              x={label.x}
              y={label.y}
              textAnchor="middle"
              direction="rtl"
              fontSize={track.id === "desktop" ? 15 : 19}
              fill={state === "idle" ? "var(--color-mist-500)" : "var(--color-mist-300)"}
            >
              {stage.short}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function StaticRoadmap() {
  return (
    <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {roadmap.stages.map((stage) => (
        <li key={stage.time} className="rounded-card border border-night-700 bg-night-900 p-6">
          <span className="font-latin text-h3 font-bold tabular-nums text-teal-300" dir="ltr">
            {stage.time}
          </span>
          <h3 className="mt-3 text-h3 font-semibold">{stage.title}</h3>
          <p className="mt-2 text-body text-mist-300">{stage.body}</p>
        </li>
      ))}
    </ol>
  );
}

export function NightRoadmap() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);
  const [near, setNear] = useState(false);

  /** Sets up after window load, in idle time, or earlier if the visitor is already a screen away. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || near) return;
    const ready = () => setNear(true);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) ready();
      },
      { rootMargin: "100% 0px" },
    );
    observer.observe(section);

    const hasIdle = typeof window.requestIdleCallback === "function";
    let idle: number | undefined;
    const schedule = () => {
      idle = hasIdle ? window.requestIdleCallback(ready, { timeout: 2500 }) : window.setTimeout(ready, 1200);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("load", schedule);
      if (idle === undefined) return;
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [near, reduce]);

  useEffect(() => {
    if (reduce !== false || !near) return;
    let cancelled = false;
    let revert: (() => void) | undefined;

    /** GSAP loads only when the visitor is a screen away, so it never competes with the first paint. */
    void loadGsap().then(({ gsap, ScrollTrigger }) => {
      const section = sectionRef.current;
      const pin = pinRef.current;
      if (cancelled || !section || !pin) return;

      const mm = gsap.matchMedia();
      revert = () => mm.revert();
      mm.add({ desktop: "(min-width: 768px)", mobile: "(max-width: 767.98px)" }, (context) => {
        const isDesktop = Boolean(context.conditions?.desktop);
        const track = isDesktop ? DESKTOP : MOBILE;
        const svg = pin.querySelector<SVGSVGElement>(isDesktop ? "[data-desktop] [data-track]" : "[data-mobile] [data-track]");
        if (!svg) return;

        const fills = Array.from(svg.querySelectorAll<SVGPathElement>("[data-fill]"));
        const length = fills[0]?.getTotalLength() ?? 1;
        fills.forEach((path) => {
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = `${length}`;
        });
        const fractions = nodeFractions(svg, track);

        const update = (progress: number) => {
          const filled = Math.min(1, progress / FILL_END);
          const offset = length * (1 - filled);
          fills.forEach((path) => (path.style.strokeDashoffset = `${offset}`));

          let next = 0;
          fractions.forEach((fraction, index) => {
            if (filled >= fraction - 0.015) next = index;
          });
          if (next !== activeRef.current) {
            activeRef.current = next;
            setActive(next);
          }
        };

        const trigger = ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: () => `+=${window.innerHeight * (isDesktop ? 3 : 2.6)}`,
          pin,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => update(self.progress),
        });

        if (clockRef.current) {
          gsap.fromTo(
            clockRef.current,
            { yPercent: 8 },
            { yPercent: -8, ease: "none", scrollTrigger: { trigger: section, start: "top top", end: () => trigger.end, scrub: true } },
          );
        }

        update(trigger.progress);
      });
    });

    return () => {
      cancelled = true;
      revert?.();
    };
  }, [reduce, near]);

  const stage = roadmap.stages[active]!;

  if (reduce) {
    return (
      <section id="how" className="border-t border-night-800 py-24 md:py-32" aria-labelledby="how-title">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="text-small font-medium text-teal-300">איך זה עובד</p>
          <h2 id="how-title" className="mt-4 max-w-3xl text-h2 font-bold text-balance">
            {roadmap.heading}
          </h2>
          <p className="mt-5 max-w-2xl text-lead text-mist-300">{roadmap.intro}</p>
          <StaticRoadmap />
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} id="how" className="relative border-t border-night-800" aria-labelledby="how-title">
      <div ref={pinRef} className="relative flex h-svh flex-col overflow-hidden">
        {SKY.map((gradient, index) => (
          <div
            key={gradient}
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out ${gradient}`}
            style={{ opacity: index === active ? 1 : 0 }}
          />
        ))}

        <div
          ref={clockRef}
          aria-hidden="true"
          className="clock-outline pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-latin text-clock font-extrabold tabular-nums select-none"
          dir="ltr"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={stage.time}
              className="inline-block"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: duration.slow, ease: ease.out }}
            >
              {stage.time}
            </motion.span>
          </AnimatePresence>
        </div>

        <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col px-5 pt-20 md:px-8 md:pt-24 short:pt-20">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-small font-medium text-teal-300">איך זה עובד</p>
              <h2 id="how-title" className="sr-only mt-2 max-w-xl text-h3 font-semibold text-mist-300 md:not-sr-only">
                {roadmap.heading}
              </h2>
            </div>
            <a
              href="#book"
              className="shrink-0 rounded-chip border border-night-600 bg-night-950/60 px-3 py-2 text-micro text-mist-300 backdrop-blur-sm transition-colors duration-100 hover:text-mist-100"
            >
              לדלג לתיאום דמו
            </a>
          </div>

          <div className="mt-6 min-h-52 max-w-2xl shrink-0 md:mt-12 md:min-h-60 short:mt-4 short:min-h-40" aria-live="polite">
            <p className="font-latin text-small font-semibold tabular-nums text-mist-500" dir="rtl">
              <bdi dir="ltr">{active + 1}/{roadmap.stages.length}</bdi>
            </p>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={stage.time} className="mt-3">
                <motion.h3
                  className="text-h2 font-bold text-balance short:text-h3"
                  initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: duration.fast, ease: ease.in } }}
                  transition={{ duration: duration.slow, ease: ease.out }}
                >
                  {stage.title}
                </motion.h3>
                <motion.p
                  className="mt-4 text-lead text-mist-300 text-pretty short:mt-2 short:text-body"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: duration.fast, ease: ease.in } }}
                  transition={{ duration: duration.slow, delay: stagger, ease: ease.out }}
                >
                  {stage.body}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative hidden min-h-44 flex-1 items-center pb-6 md:flex" data-desktop>
            <TrackSvg track={DESKTOP} active={active} className="h-full max-h-96 w-full overflow-visible" />
          </div>
          <div className="relative flex min-h-0 flex-1 justify-center pb-20 md:hidden" data-mobile>
            <TrackSvg track={MOBILE} active={active} className="h-full w-auto max-w-full" />
          </div>
        </div>

        <ol className="sr-only">
          {roadmap.stages.map((item) => (
            <li key={item.time}>
              {item.time}: {item.title}. {item.body}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
