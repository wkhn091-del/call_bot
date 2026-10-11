"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

/** A34 reading progress: a 2px line under the header that fills as the page scrolls. Transform only. */
export function ScrollProgress() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      className="absolute inset-x-0 -bottom-px h-0.5 origin-right bg-linear-to-l from-teal-400 to-teal-300"
      style={{ scaleX: reduce ? scrollYProgress : smooth }}
    />
  );
}
