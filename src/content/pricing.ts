import type { FaqItem } from "./home";

export type PriceTier = {
  name: string;
  pricePerCall: number;
  minimumMonthly: number | null;
  note: string;
};

/**
 * Real per-call prices from the client. Empty until they arrive; the page then shows the
 * model only and sends visitors to the demo for a quote, so no figure is ever invented.
 */
export const tiers: readonly PriceTier[] = [];

/** B2B convention in Israel is to quote before VAT; switch to true if the client decides otherwise. */
export const PRICES_INCLUDE_VAT = false;

export const included = [
  "מענה בשם העסק כשאתם לא עונים: בערב, בסוף השבוע, בחגים ובשעות עומס",
  "שיחה טבעית בעברית מדוברת, כולל סלנג ומבטאים",
  "קביעת תורים ופגישות, או איסוף פרטים לחזרה",
  "כרטיס ליד מלא שנכנס ל-Monday או ל-Powerlink",
];

export const pricingFaq: readonly FaqItem[] = [
  {
    q: "מה נחשב שיחה?",
    a: "שיחה שהבוט ענה עליה. את ההגדרה המדויקת ואת המחיר לפי נפח השיחות שלכם תקבלו בדמו.",
  },
  {
    q: "יש מנוי חודשי?",
    a: "לא. התמחור הוא לפי שיחה, ולכן בחודש שקט משלמים פחות.",
  },
  {
    q: "למה אין כאן מחיר מדויק?",
    a: "המחיר תלוי בכמות השיחות ובאינטגרציות שתצטרכו. בדמו של 15 דקות נבנה איתכם הצעה מדויקת, בלי התחייבות.",
  },
];
