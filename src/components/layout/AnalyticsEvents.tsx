"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/lib/analytics/track";

const STEP_ONE_FIELDS = new Set(["firstName", "lastName", "email", "phone"]);
const STEP_TWO_FIELDS = new Set(["company", "companySize", "industry"]);

/** Where on the page a click happened: the nearest section id, or the header/footer landmark. */
function locationOf(element: Element): string {
  if (element.closest("header")) return "header";
  if (element.closest("footer")) return "footer";
  const section = element.closest("section[id], section[aria-labelledby]");
  return section?.id || section?.getAttribute("aria-labelledby") || "page";
}

/**
 * Page-wide listeners for the KPIs in PROJECT_BRIEF.md. Delegated from `document`, so sections stay
 * free of tracking code. Each event fires once per page view, except CTA clicks.
 */
export function AnalyticsEvents() {
  const pathname = usePathname();

  useEffect(() => {
    const startedFields = new Set<string>();
    let calculatorUsed = false;

    const onClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>('a[href*="#book"], a[href*="#demo"]');
      if (link) {
        const cta = link.id || (link.getAttribute("href")?.includes("#demo") ? "see_demo" : "book_demo");
        track("cta_click", { cta, location: locationOf(link) });
      }
      if (!calculatorUsed && target?.closest('#hours [role="switch"]')) {
        calculatorUsed = true;
        track("calculator_use", { control: "switch" });
      }
    };

    const onChange = (event: Event) => {
      const target = event.target instanceof HTMLElement ? event.target : null;
      if (calculatorUsed || !target?.closest("#hours")) return;
      calculatorUsed = true;
      track("calculator_use", { control: target instanceof HTMLSelectElement ? "hours" : "slider" });
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
      if (!target.closest("#book form")) return;
      const field = target.name;
      const step = STEP_ONE_FIELDS.has(field) ? 1 : STEP_TWO_FIELDS.has(field) ? 2 : null;
      if (!step || startedFields.has(field)) return;
      startedFields.add(field);
      track("form_field_start", { form_step: step, field });
    };

    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    document.addEventListener("focusin", onFocusIn);

    const book = document.getElementById("book");
    const observer = book
      ? new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
              observer?.disconnect();
              track("form_reached", {});
            }
          },
          { threshold: 0.25 },
        )
      : null;
    if (book) observer?.observe(book);

    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("change", onChange);
      document.removeEventListener("focusin", onFocusIn);
      observer?.disconnect();
    };
  }, [pathname]);

  return null;
}
