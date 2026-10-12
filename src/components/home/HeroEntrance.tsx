"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { duration, ease } from "@/lib/motion/tokens";

type Props = {
  children: ReactNode;
  className?: string;
  /** Seconds after first paint. */
  delay?: number;
  /** Rise distance in px. */
  y?: number;
};

/**
 * Secondary hero entrance only. Never wrap the H1 — it must paint with the server HTML (LCP).
 */
export function HeroEntrance({ children, className, delay = 0, y = 10 }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: duration.fast, ease: ease.out }}
    >
      {children}
    </motion.div>
  );
}
