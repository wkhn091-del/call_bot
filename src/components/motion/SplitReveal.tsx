"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";
import { afterLoadIdle, loadGsap, prefersReducedMotion } from "@/lib/motion/gsap";
import { duration, gsapEase } from "@/lib/motion/tokens";

type Props = {
  children: ReactNode;
  as?: ElementType;
  id?: string;
  className?: string;
};

const LINE_STAGGER = 0.1;

/**
 * Section headline reveal (A02, from motion-kit): each line rises from behind a mask once.
 * Never use it on the hero H1, which is the LCP element and must paint immediately.
 * Lines are re-measured when fonts load or the viewport resizes (SplitText autoSplit).
 */
export function SplitReveal({ children, as: Tag = "h2", id, className }: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (prefersReducedMotion()) {
      element.removeAttribute("data-motion-pending");
      return;
    }

    let cancelled = false;
    let revert: (() => void) | undefined;

    void afterLoadIdle()
      .then(loadGsap)
      .then(({ gsap, SplitText }) => {
        if (cancelled) return;
        const split = SplitText.create(element, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          aria: "auto",
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: duration.reveal,
              ease: gsapEase.out,
              stagger: LINE_STAGGER,
              scrollTrigger: { trigger: element, start: "top 88%", once: true },
            });
          },
        });
        element.removeAttribute("data-motion-pending");
        revert = () => split.revert();
      })
      .catch(() => element.removeAttribute("data-motion-pending"));

    return () => {
      cancelled = true;
      revert?.();
    };
  }, []);

  return (
    <Tag ref={ref} id={id} className={className} data-motion-pending="">
      {children}
    </Tag>
  );
}
