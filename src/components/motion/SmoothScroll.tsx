"use client";

import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { afterLoadIdle, loadGsap, prefersReducedMotion } from "@/lib/motion/gsap";

/** Leaves room for the sticky header when Lenis scrolls to an anchor such as #book. */
const ANCHOR_OFFSET = -72;

/**
 * Inertia scrolling on wheel and trackpad (A03). Touch keeps native scrolling. Starts after load in
 * idle time, and never for visitors who asked for reduced motion. Inner scroll areas opt out with
 * `data-lenis-prevent`.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    let cancelled = false;
    let destroy: (() => void) | undefined;

    void afterLoadIdle()
      .then(() => Promise.all([import("lenis"), loadGsap()]))
      .then(([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
        if (cancelled) return;
        const lenis = new Lenis({
          lerp: 0.14,
          autoRaf: false,
          anchors: { offset: ANCHOR_OFFSET },
          stopInertiaOnNavigate: true,
        });
        lenis.on("scroll", ScrollTrigger.update);
        const tick = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        destroy = () => {
          gsap.ticker.remove(tick);
          lenis.destroy();
        };
      });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return null;
}
