export const site = {
  brand: "CALLBOT",
  company: "AfterHours AI",
  domain: "afterhours.ai",
  description:
    "CALLBOT עונה לשיחות של העסק כשאתם לא זמינים, מנהל שיחה בעברית מדוברת, קובע פגישות ושולח את הליד ל-Monday או ל-Powerlink. תמחור לפי שיחה, בלי מנוי חודשי קבוע.",
  demoMinutes: 15,
  nav: [
    { href: "/#how", label: "איך זה עובד" },
    { href: "/#demo", label: "שיחה לדוגמה" },
    { href: "/pricing", label: "תמחור" },
    { href: "/#faq", label: "שאלות" },
  ],
  /**
   * Values the client still has to supply (PROJECT_BRIEF.md, "סתירות פתוחות").
   * Each block renders only when its fields are filled, so nothing invented reaches the page.
   */
  legal: {
    legalName: null as string | null,
    companyId: null as string | null,
    address: null as string | null,
  },
  contact: {
    salesPhone: null as string | null,
    salesEmail: null as string | null,
    hours: null as string | null,
  },
  accessibility: {
    coordinatorName: null as string | null,
    coordinatorEmail: null as string | null,
    coordinatorPhone: null as string | null,
    lastReviewed: "11.10.2026",
  },
} as const;
