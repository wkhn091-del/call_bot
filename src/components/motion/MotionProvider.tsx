"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Motion injects <style> tags for popLayout; the nonce lets them pass the CSP. */
export function MotionProvider({ nonce, children }: { nonce: string; children: ReactNode }) {
  return <MotionConfig nonce={nonce}>{children}</MotionConfig>;
}
