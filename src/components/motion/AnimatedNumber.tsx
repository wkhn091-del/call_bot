"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { duration, ease } from "@/lib/motion/tokens";

type Props = {
  value: number;
  format: (value: number) => string;
  className?: string;
};

/** Rolls to the new value so the eye registers that the figure changed. */
export function AnimatedNumber({ value, format, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const current = useRef(value);
  const reduce = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (reduce) {
      element.textContent = format(value);
      current.current = value;
      return;
    }
    const controls = animate(current.current, value, {
      duration: duration.slow,
      ease: ease.out,
      onUpdate: (latest) => {
        current.current = latest;
        element.textContent = format(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value, format, reduce]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
