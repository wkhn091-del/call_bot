/** Mirrors the `--motion-*` and `--ease-*` tokens in globals.css, in seconds, for Motion and GSAP. */
export const duration = {
  instant: 0.1,
  fast: 0.18,
  base: 0.28,
  slow: 0.52,
  /** Headline line reveals (SplitReveal) only: long enough to read as one gesture, not a flicker. */
  reveal: 0.8,
} as const;

/** GSAP names for the same curves: expo.out is the closest built-in to `ease.out`. */
export const gsapEase = {
  out: "expo.out",
  spring: "elastic.out(1, 0.45)",
} as const;

export const ease = {
  out: [0.16, 1, 0.3, 1],
  in: [0.7, 0, 0.84, 0],
} as const;

export const spring = { type: "spring", stiffness: 400, damping: 30 } as const;

/** Upper bound for stagger between siblings in one reveal. */
export const stagger = 0.06;
