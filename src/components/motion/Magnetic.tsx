"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

type Props = { children: ReactNode; strength?: number; className?: string };

const SPRING = { stiffness: 260, damping: 18, mass: 0.5 } as const;

/**
 * A11 magnetic CTA (motion-kit): the button leans toward a mouse cursor and springs back on leave.
 * Ignores touch and pen, and does nothing for reduced-motion visitors. Moves with transform only.
 */
export function Magnetic({ children, strength = 0.3, className }: Props) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);

  const onMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span className={className} style={{ x: springX, y: springY }} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </motion.span>
  );
}
