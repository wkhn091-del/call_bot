import type { FaqItem } from "@/content/home";

type Props = { items: readonly FaqItem[]; heading?: string };

export function Faq({ items, heading = "מה שואלים לפני שסוגרים" }: Props) {
  return (
    <section id="faq" className="border-t border-night-800 py-12 md:py-16" aria-labelledby="faq-title">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <div className="mb-5" data-reveal>
          <p className="text-small font-medium text-teal-300">שאלות נפוצות</p>
          <h2 id="faq-title" className="mt-2 text-h2 font-bold text-balance">
            {heading}
          </h2>
        </div>
        <div data-reveal>
          {items.map((item) => (
            <details key={item.q} className="group border-b border-night-700 first:border-t">
              <summary className="flex cursor-pointer list-none items-start gap-3 py-3.5 text-body font-semibold text-mist-100">
                <span className="min-w-0 flex-1 text-pretty">{item.q}</span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-night-600 text-mist-300 transition-transform duration-300 ease-[var(--ease-spring)] group-open:rotate-45"
                >
                  <svg viewBox="0 0 16 16" className="size-3">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="pb-4 pe-10 text-body text-mist-300">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
