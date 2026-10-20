"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { CONSENT_STORAGE_KEY, readConsent, type Consent } from "@/lib/analytics/consent";

const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function writeConsent(value: Consent) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    /* Private mode: the choice holds for this page view only. */
  }
  listeners.forEach((listener) => listener());
}

function loadGtm(gtmId: string, nonce: string) {
  if (document.getElementById("gtm-loader")) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.id = "gtm-loader";
  script.async = true;
  script.nonce = nonce;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`;
  document.head.appendChild(script);
}

type Props = { gtmId: string | null; nonce: string };

/** Rule 8: nothing pops over the page in the first 10 seconds unless the visitor has started scrolling. */
const BANNER_DELAY_MS = 10_000;

function useBannerReady(): boolean {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (ready) return;
    const show = () => setReady(true);
    const timer = window.setTimeout(show, BANNER_DELAY_MS);
    window.addEventListener("scroll", show, { once: true, passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", show);
    };
  }, [ready]);
  return ready;
}

export function ConsentAndAnalytics({ gtmId, nonce }: Props) {
  const consent = useSyncExternalStore<Consent | null | "pending">(subscribe, readConsent, () => "pending");
  const bannerReady = useBannerReady();

  useEffect(() => {
    if (consent === "granted" && gtmId) loadGtm(gtmId, nonce);
  }, [consent, gtmId, nonce]);

  if (consent !== null || !bannerReady) return null;

  return (
    <div
      role="region"
      aria-label="הסכמה לעוגיות"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-xl rounded-card border border-night-600 bg-night-900/95 p-4 shadow-panel backdrop-blur-md md:inset-x-auto md:start-6"
    >
      <p className="text-small text-mist-300">
        משתמשים בעוגיות למדידה ולשיפור האתר, וכדי להבין מאילו קמפיינים הגעתם. אפשר לסרב — האתר יעבוד אותו דבר.{" "}
        <Link href="/privacy" className="text-teal-300 underline underline-offset-4">
          מדיניות פרטיות
        </Link>
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => writeConsent("granted")}
          className="min-h-11 rounded-control bg-teal-400 px-5 text-small font-semibold text-night-950 transition duration-100 hover:bg-teal-300"
        >
          לאשר עוגיות
        </button>
        <button
          type="button"
          onClick={() => writeConsent("denied")}
          className="min-h-11 rounded-control border border-night-600 px-5 text-small text-mist-100 transition duration-100 hover:bg-night-800"
        >
          רק הכרחיות
        </button>
      </div>
    </div>
  );
}
