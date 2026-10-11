import type { gsap as GsapCore } from "gsap";
import type { ScrollTrigger as ScrollTriggerPlugin } from "gsap/ScrollTrigger";
import type { SplitText as SplitTextPlugin } from "gsap/SplitText";

export type GsapKit = {
  gsap: typeof GsapCore;
  ScrollTrigger: typeof ScrollTriggerPlugin;
  SplitText: typeof SplitTextPlugin;
};

let kit: Promise<GsapKit> | null = null;

/**
 * GSAP is never in the first-load bundle: every caller goes through this dynamic import,
 * so the roadmap, headline reveals and smooth scroll share one registered instance.
 */
export function loadGsap(): Promise<GsapKit> {
  kit ??= Promise.all([import("gsap"), import("gsap/ScrollTrigger"), import("gsap/SplitText")]).then(
    ([{ gsap }, { ScrollTrigger }, { SplitText }]) => {
      gsap.registerPlugin(ScrollTrigger, SplitText);
      ScrollTrigger.config({ ignoreMobileResize: true });
      return { gsap, ScrollTrigger, SplitText };
    },
  );
  return kit;
}

let idle: Promise<void> | null = null;

/** Resolves after window load, in idle time, so motion code never competes with the first paint (LCP). */
export function afterLoadIdle(): Promise<void> {
  idle ??= new Promise((resolve) => {
    const schedule = () => {
      if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => resolve(), { timeout: 2500 });
      else window.setTimeout(resolve, 1200);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
  });
  return idle;
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function hasFinePointer(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
