"use client";

import { useId, useMemo, useState, type CSSProperties } from "react";
import { AnimatedNumber } from "@/components/motion/AnimatedNumber";
import { CtaLink } from "@/components/ui/CtaLink";
import { isOpen, LIMITS, monthlyLoss, weeklyHours, type OpeningHours } from "@/lib/calc/missed-calls";

const DAYS = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"] as const;
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MAX_DOTS = 40;

const pad = (hour: number) => `${String(hour).padStart(2, "0")}:00`;
const integer = new Intl.NumberFormat("he-IL", { maximumFractionDigits: 0 });
const formatInt = (value: number) => integer.format(value);
const formatShekel = (value: number) => `₪${integer.format(value)}`;

/** Deterministic 0..1 noise per cell, so the dots never jump between renders or between server and client. */
const noise = (day: number, hour: number) => {
  const x = Math.sin(day * 127.1 + hour * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Most after-hours calls come in the early evening and on Saturday; very few at 3am. */
const callWeight = (day: number, hour: number) => {
  const byHour = hour >= 17 && hour <= 21 ? 1 : hour >= 6 && hour <= 23 ? 0.6 : 0.12;
  return day === 6 ? byHour * 1.3 : byHour;
};

function pickCallCells(hours: OpeningHours, count: number): Set<string> {
  const closed: { key: string; score: number }[] = [];
  for (let day = 0; day < 7; day += 1) {
    for (let hour = 0; hour < 24; hour += 1) {
      if (!isOpen(hours, day, hour)) closed.push({ key: `${day}-${hour}`, score: callWeight(day, hour) * noise(day, hour) });
    }
  }
  closed.sort((a, b) => b.score - a.score);
  return new Set(closed.slice(0, count).map((cell) => cell.key));
}

type SelectProps = {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
};

function Select({ label, value, options, onChange, className = "" }: SelectProps) {
  const id = useId();
  return (
    <div className={`flex flex-col justify-end gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-micro text-mist-400">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-11 w-full cursor-pointer appearance-none rounded-control border border-night-600 bg-night-950 ps-3 pe-9 font-latin text-body font-medium tabular-nums text-mist-100 transition-colors duration-150 hover:border-mist-500 focus:border-teal-400"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <svg
          viewBox="0 0 20 20"
          className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-teal-300"
          aria-hidden="true"
        >
          <path d="m5 8 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
};

function Slider({ label, value, min, max, step, display, onChange }: SliderProps) {
  const id = useId();
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={id} className="text-small text-mist-300">
          {label}
        </label>
        <output
          htmlFor={id}
          className="rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-0.5 font-latin text-small font-semibold tabular-nums text-teal-300"
          dir="ltr"
        >
          {display}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-input"
        style={{
          background: `linear-gradient(to left, var(--color-teal-400) ${percent}%, var(--color-night-700) ${percent}%) center / 100% 6px no-repeat`,
        }}
      />
    </div>
  );
}

export function HoursCalculator() {
  const [hours, setHours] = useState<OpeningHours>({ weekdayOpen: 8, weekdayClose: 18, fridayClose: 13 });
  const [covered, setCovered] = useState(false);
  const [touchedSwitch, setTouchedSwitch] = useState(false);
  const [missedPerWeek, setMissedPerWeek] = useState(15);
  const [closeRate, setCloseRate] = useState(20);
  const [dealValue, setDealValue] = useState(800);

  const week = useMemo(() => weeklyHours(hours), [hours]);
  const callCells = useMemo(() => pickCallCells(hours, Math.min(missedPerWeek, MAX_DOTS)), [hours, missedPerWeek]);
  const loss = useMemo(
    () => monthlyLoss({ missedPerWeek, closeRatePercent: closeRate, dealValue }),
    [missedPerWeek, closeRate, dealValue],
  );
  const closedShare = Math.round((week.closed / (week.open + week.closed)) * 100);

  const openOptions = [6, 7, 8, 9, 10].map((hour) => ({ value: String(hour), label: pad(hour) }));
  const closeOptions = [14, 16, 17, 18, 19, 20, 22].map((hour) => ({ value: String(hour), label: pad(hour) }));
  const fridayOptions = [
    { value: "closed", label: "סגור" },
    ...[12, 13, 14].map((hour) => ({ value: String(hour), label: `עד ${pad(hour)}` })),
  ];

  const toggleCovered = () => {
    setCovered((value) => !value);
    setTouchedSwitch(true);
  };

  return (
    <section id="hours" className="relative border-t border-night-800 py-24 md:py-32" aria-labelledby="hours-title">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-3xl" data-reveal>
          <p className="text-small font-medium text-missed-400">השעות שאף אחד לא עונה בהן</p>
          <h2 id="hours-title" className="mt-4 text-h2 font-bold text-balance">
            העסק פתוח <AnimatedNumber value={week.open} format={formatInt} className="font-latin tabular-nums" /> שעות
            בשבוע. בשאר{" "}
            <AnimatedNumber value={week.closed} format={formatInt} className="font-latin tabular-nums text-missed-400" />{" "}
            השעות הטלפון ממשיך לצלצל.
          </h2>
          <p className="mt-5 text-lead text-mist-300">
            בחרו את שעות הפעילות שלכם וראו כמה מהשבוע נשאר בלי מענה.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:items-start">
          <div className="rounded-panel border border-night-700 bg-night-900 p-5 md:p-7 lg:col-span-7" data-reveal>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Select
                label="פותחים ב־ (א׳ עד ה׳)"
                value={String(hours.weekdayOpen)}
                options={openOptions}
                onChange={(value) => setHours((previous) => ({ ...previous, weekdayOpen: Number(value) }))}
              />
              <Select
                label="סוגרים ב־"
                value={String(hours.weekdayClose)}
                options={closeOptions}
                onChange={(value) => setHours((previous) => ({ ...previous, weekdayClose: Number(value) }))}
              />
              <Select
                label="יום שישי"
                className="col-span-2 sm:col-span-1"
                value={hours.fridayClose === null ? "closed" : String(hours.fridayClose)}
                options={fridayOptions}
                onChange={(value) =>
                  setHours((previous) => ({ ...previous, fridayClose: value === "closed" ? null : Number(value) }))
                }
              />
            </div>

            <div
              className="mt-7 rounded-card border border-night-700/70 bg-night-950/60 p-3 md:p-4"
              role="img"
              aria-label={`רשת שבועית: ${week.open} שעות פתוחות ו-${week.closed} שעות בלי מענה. הנקודות מסמנות ${callCells.size} שיחות שנכנסות כשהעסק סגור.`}
            >
              <div className="flex flex-col gap-1" dir="rtl">
                {DAYS.map((day, dayIndex) => (
                  <div key={day} className="flex items-center gap-2">
                    <span className="w-5 shrink-0 text-micro text-mist-500">{day}</span>
                    <div className="grid flex-1 grid-cols-24 gap-0.75" dir="ltr">
                      {HOURS.map((hour) => {
                        const open = isOpen(hours, dayIndex, hour);
                        const call = !open && callCells.has(`${dayIndex}-${hour}`);
                        return (
                          <span
                            key={hour}
                            className={`relative grid h-3 place-items-center rounded-[3px] transition-colors duration-500 ease-out md:h-4 ${
                              open ? "bg-mist-100/12" : covered ? "bg-teal-400/25" : "bg-missed-400/30"
                            }`}
                            style={{ transitionDelay: open ? "0ms" : `${hour * 12}ms` }}
                          >
                            {call && (
                              <>
                                {!covered && (
                                  <span
                                    className="call-ping absolute size-1.5 rounded-full bg-missed-400 md:size-2"
                                    style={{ "--ping-delay": `${(noise(hour, dayIndex) * 2.4).toFixed(2)}s` } as CSSProperties}
                                  />
                                )}
                                <span
                                  className={`relative size-1.5 rounded-full transition-colors duration-500 md:size-2 ${
                                    covered ? "bg-teal-300" : "bg-missed-400"
                                  }`}
                                />
                              </>
                            )}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="mt-1 flex items-center gap-2">
                  <span className="w-5 shrink-0" />
                  <div className="flex flex-1 justify-between font-latin text-micro tabular-nums text-mist-500" dir="ltr">
                    <span>00:00</span>
                    <span>06:00</span>
                    <span>12:00</span>
                    <span>18:00</span>
                    <span>24:00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-micro text-mist-400">
              <span className="inline-flex items-center gap-2">
                <span className="size-3 rounded-[3px] bg-mist-100/12" /> יש מי שיענה
              </span>
              <span className="inline-flex items-center gap-2">
                <span className={`size-3 rounded-[3px] transition-colors duration-500 ${covered ? "bg-teal-400/25" : "bg-missed-400/30"}`} />
                {covered ? "CALLBOT עונה" : "אין מענה"}
              </span>
              <span className="inline-flex items-center gap-2">
                <span className={`size-2 rounded-full transition-colors duration-500 ${covered ? "bg-teal-300" : "bg-missed-400"}`} />
                {covered ? "שיחה שנענתה" : "שיחה שנכנסת כשסגור"}
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={covered}
              onClick={toggleCovered}
              className={`group relative mt-6 flex w-full items-center justify-between gap-4 rounded-card border p-4 text-start transition-colors duration-300 md:p-5 ${
                covered ? "border-teal-400/40 bg-teal-400/8" : "border-night-600 bg-night-950/60 hover:border-teal-400/40"
              }`}
            >
              {!touchedSwitch && (
                <span
                  aria-hidden="true"
                  className="switch-invite pointer-events-none absolute -inset-px rounded-card border border-teal-400/50"
                />
              )}
              <span className="flex flex-col">
                <span className="text-body font-semibold text-mist-100">
                  {covered ? "ככה השבוע נראה עם CALLBOT" : "מה היה קורה עם CALLBOT?"}
                </span>
                <span className="text-small text-mist-400">
                  {covered ? "כל שיחה שנכנסת כשסגור נענית, והליד נכנס למערכת." : "לחצו וראו את השעות האדומות מתמלאות."}
                </span>
              </span>
              <span
                className={`relative h-7 w-13 shrink-0 rounded-full transition-colors duration-300 ${covered ? "bg-teal-400" : "bg-night-600"}`}
                aria-hidden="true"
              >
                <span
                  className={`absolute start-1 top-1 size-5 rounded-full bg-mist-100 shadow-[var(--shadow-contact)] transition-transform duration-300 ease-[var(--ease-spring)] ${
                    covered ? "-translate-x-6" : "translate-x-0"
                  }`}
                />
              </span>
            </button>

            <dl className="mt-6 grid grid-cols-3 divide-x divide-x-reverse divide-night-700">
              <div className="pe-4">
                <dt className="text-micro text-mist-400">שעות עם מענה</dt>
                <dd className="mt-1 font-latin text-h3 font-semibold tabular-nums text-mist-100">
                  <AnimatedNumber value={covered ? week.open + week.closed : week.open} format={formatInt} />
                </dd>
              </div>
              <div className="px-4">
                <dt className="text-micro text-mist-400">{covered ? "שעות ש-CALLBOT עונה" : "שעות בלי מענה"}</dt>
                <dd
                  className={`mt-1 font-latin text-h3 font-semibold tabular-nums transition-colors duration-500 ${
                    covered ? "text-teal-300" : "text-missed-400"
                  }`}
                >
                  <AnimatedNumber value={week.closed} format={formatInt} />
                </dd>
              </div>
              <div className="ps-4">
                <dt className="text-micro text-mist-400">{covered ? "מהשבוע מכוסה" : "מהשבוע בלי מענה"}</dt>
                <dd className="mt-1 font-latin text-h3 font-semibold tabular-nums text-mist-100">
                  <AnimatedNumber value={covered ? 100 : closedShare} format={(value) => `${formatInt(value)}%`} />
                </dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-6 lg:sticky lg:top-24 lg:col-span-5" data-reveal>
            <div
              className="relative overflow-hidden rounded-panel border border-missed-400/30 bg-night-900 p-5 md:p-7"
              aria-live="polite"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 -top-24 mx-auto size-64 rounded-full bg-missed-400/15 blur-3xl"
              />
              <p className="relative text-small text-mist-300">לפי מה שהזנתם, בכל חודש הולכים למתחרים</p>
              <p className="relative mt-2 text-display leading-none font-extrabold">
                <bdi dir="ltr" className="font-latin tabular-nums text-missed-400">
                  <AnimatedNumber value={loss.value} format={formatShekel} />
                </bdi>
              </p>
              <p className="relative mt-3 text-small text-mist-300">
                בערך <AnimatedNumber value={loss.customers} format={formatInt} className="font-latin font-semibold tabular-nums text-mist-100" />{" "}
                לקוחות שהתקשרו ולא קיבלו מענה. בשנה זה{" "}
                <bdi dir="ltr" className="font-latin font-semibold tabular-nums text-mist-100">
                  <AnimatedNumber value={loss.value * 12} format={formatShekel} />
                </bdi>
                .
              </p>
            </div>

            <div className="rounded-panel border border-night-700 bg-night-900 p-5 md:p-7">
              <h3 className="text-body font-semibold">כווננו לפי העסק שלכם</h3>
              <p className="mt-1 text-micro text-mist-500">הערכים ההתחלתיים הם דוגמה בלבד.</p>

              <div className="mt-4 flex flex-col gap-3">
                <Slider
                  label="שיחות שלא נענות בשבוע"
                  {...LIMITS.missedPerWeek}
                  value={missedPerWeek}
                  display={formatInt(missedPerWeek)}
                  onChange={setMissedPerWeek}
                />
                <Slider
                  label="מתוכן היו הופכות ללקוח"
                  {...LIMITS.closeRatePercent}
                  value={closeRate}
                  display={`${closeRate}%`}
                  onChange={setCloseRate}
                />
                <Slider
                  label="שווי ממוצע של לקוח"
                  {...LIMITS.dealValue}
                  value={dealValue}
                  display={formatShekel(dealValue)}
                  onChange={setDealValue}
                />
              </div>

              <CtaLink href="#book" className="mt-6 w-full">
                לתיאום דמו של 15 דקות
              </CtaLink>
              <p className="mt-3 text-center text-micro text-mist-500">החישוב רץ אצלכם בדפדפן. לא שומרים ולא שולחים אותו.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
