import type { FaqItem } from "@/content/home";

type Props = { items: readonly FaqItem[]; heading?: string };

export function Faq({ items, heading = "שאלות שבעלי עסקים שואלים אותנו" }: Props) {
  return (
    <section id="faq" className="border-t border-night-800 py-16 md:py-24" aria-labelledby="faq-title">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="mb-8" data-reveal>
          <p className="text-small font-medium text-teal-300">שאלות נפוצות</p>
          <h2 id="faq-title" className="mt-3 text-h2 font-bold text-balance">
            {heading}
          </h2>
        </div>
        <div data-reveal>
          {items.map((item) => (
            <details key={item.q} className="group border-b border-night-700 first:border-t">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lead font-semibold text-mist-100">
                {item.q}
                <span
                  aria-hidden="true"
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-night-600 text-mist-300 transition-transform duration-300 ease-out group-open:rotate-45"
                >
                  <svg viewBox="0 0 16 16" className="size-3.5">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="pb-6 text-body text-mist-300">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
