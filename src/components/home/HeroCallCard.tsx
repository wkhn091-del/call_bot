"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { duration, ease } from "@/lib/motion/tokens";

const LINES = [
  { speaker: "CALLBOT", text: "ערב טוב, הגעתם למוסך א.ב. רכב. במה אפשר לעזור?" },
  { speaker: "הלקוח", text: "יש לי חריקה כזאת מהגלגל כל פעם שאני בולם." },
  { speaker: "CALLBOT", text: "יש מקום ביום ראשון ב-08:30. לרשום אותך?" },
] as const;

/** Stage 0 ringing, 1 answered, 2-4 transcript lines, 5 lead sent. Plays once, never loops. */
const TIMELINE_MS = [900, 700, 1500, 1500, 1400];
const FINAL = 5;

export function HeroCallCard() {
  const reduce = useReducedMotion();
  const [stage, setStage] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const current = reduce ? FINAL : stage;

  /** Starts after window load so the sequence never competes with the hero image for the main thread. */
  useEffect(() => {
    const start = () => window.setTimeout(() => setLoaded(true), 0);
    if (document.readyState === "complete") {
      const timer = start();
      return () => window.clearTimeout(timer);
    }
    window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  useEffect(() => {
    if (reduce || !loaded || stage >= FINAL) return;
    const timer = window.setTimeout(() => setStage((value) => value + 1), TIMELINE_MS[stage]);
    return () => window.clearTimeout(timer);
  }, [stage, reduce, loaded]);

  const answered = current >= 1;
  const visibleLines = Math.max(0, Math.min(LINES.length, current - 1));

  return (
    <div className="w-full max-w-sm rounded-panel border border-mist-100/10 bg-night-950/70 p-4 shadow-panel backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <span
          className={`relative grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-500 ${
            answered ? "bg-teal-400 text-night-950" : "bg-mist-100/10 text-mist-100"
          }`}
          aria-hidden="true"
        >
          {!answered && !reduce ? <span className="absolute inset-0 animate-ping rounded-full bg-teal-400/40" /> : null}
          <svg viewBox="0 0 24 24" className="relative size-5">
            <path
              d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1Z"
              fill="currentColor"
            />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-small font-semibold text-mist-100">מוסך א.ב. רכב</p>
          <p className="text-micro text-mist-400" aria-live="polite">
            {answered ? "CALLBOT ענה בשם העסק" : "שיחה נכנסת · אין מי שיענה"}
          </p>
        </div>
        <span className="font-latin text-micro tabular-nums text-mist-400" dir="ltr">
          21:40
        </span>
      </div>

      <ol className="mt-4 flex min-h-44 flex-col gap-2">
        <AnimatePresence initial={false}>
          {LINES.slice(0, visibleLines).map((line, index) => (
            <motion.li
              key={index}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.base, ease: ease.out }}
              className={`rounded-card px-3 py-2 text-small ${
                line.speaker === "CALLBOT" ? "me-6 bg-teal-400/12 text-mist-100" : "ms-6 bg-mist-100/8 text-mist-100"
              }`}
            >
              <span className="block text-micro font-semibold text-mist-400">{line.speaker}</span>
              {line.text}
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      <div
        className={`mt-3 flex items-center justify-between gap-3 rounded-card border px-3 py-2.5 transition-colors duration-500 ${
          current >= FINAL ? "border-teal-400/40 bg-teal-400/10" : "border-mist-100/10 bg-transparent"
        }`}
      >
        <p className="text-micro text-mist-300">
          {current >= FINAL ? (
            <>
              <span className="font-semibold text-mist-100">יוסי כהן</span> · ראשון{" "}
              <bdi dir="ltr" className="font-latin tabular-nums">08:30</bdi> · נשלח ל-<bdi dir="ltr">Monday</bdi>
            </>
          ) : (
            "כרטיס הליד נבנה מתוך השיחה…"
          )}
        </p>
        <span
          className={`grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-500 ${
            current >= FINAL ? "bg-teal-400 text-night-950" : "bg-mist-100/10 text-transparent"
          }`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 20 20" className="size-3.5">
            <path d="m5 10.5 3.2 3L15 6.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>
    </div>
  );
}
