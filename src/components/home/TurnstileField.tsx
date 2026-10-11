"use client";

import { useEffect, useRef } from "react";

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileOptions = {
  sitekey: string;
  action: string;
  appearance: "always" | "execute" | "interaction-only";
  theme: "light" | "dark" | "auto";
  language: string;
  size: "normal" | "flexible" | "compact";
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileOptions) => string | undefined;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null;

/** Loaded by a trusted script, so the CSP's 'strict-dynamic' admits it without a host allowlist. */
function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile did not initialise")));
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile script failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

type Props = {
  siteKey: string | null;
  action: "demo_step1" | "demo_step2";
  /**
   * Changes after every server response. A token is single-use and siteverify consumes it even when
   * the submission then fails validation, so the widget must issue a fresh one before the next try.
   */
  resetSignal: unknown;
};

/**
 * Renders inside a <form>. Turnstile adds a hidden `cf-turnstile-response` input to the container,
 * so the token travels with the form data. Most visitors never see it (interaction-only).
 */
export function TurnstileField({ siteKey, action, resetSignal }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<string | undefined>(undefined);
  const firstSignal = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!siteKey || !container) return;

    let cancelled = false;

    const mount = () => {
      loadTurnstile()
        .then((turnstile) => {
          if (cancelled) return;
          widgetRef.current = turnstile.render(container, {
            sitekey: siteKey,
            action,
            appearance: "interaction-only",
            theme: "dark",
            language: "he",
            size: "flexible",
          });
        })
        .catch(() => {
          /* The server rejects the submission without a token and shows a retry message. */
        });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          mount();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(container);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (widgetRef.current) window.turnstile?.remove(widgetRef.current);
      widgetRef.current = undefined;
    };
  }, [siteKey, action]);

  useEffect(() => {
    if (firstSignal.current) {
      firstSignal.current = false;
      return;
    }
    if (widgetRef.current) window.turnstile?.reset(widgetRef.current);
  }, [resetSignal]);

  if (!siteKey) return null;
  return <div ref={containerRef} />;
}
