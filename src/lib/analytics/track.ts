import { readConsent } from "./consent";

/**
 * Every event the site sends to GTM. Parameters are ids and field names only, never what the
 * visitor typed: GA4 forbids PII and the privacy policy promises it.
 */
export type AnalyticsEvents = {
  cta_click: { cta: string; location: string };
  form_reached: Record<string, never>;
  form_field_start: { form_step: 1 | 2; field: string };
  form_error: { form_step: 1 | 2; field: string };
  form_step_complete: { form_step: 1 };
  demo_call_select: { call: string };
  demo_call_complete: { call: string };
  calculator_use: { control: "hours" | "slider" | "switch" };
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Pushes only after consent. GTM replays the whole dataLayer when it loads, so anything pushed
 * before consent would be sent the moment the visitor accepts.
 */
export function track<E extends keyof AnalyticsEvents>(event: E, params: AnalyticsEvents[E]): void {
  if (typeof window === "undefined" || readConsent() !== "granted") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}
