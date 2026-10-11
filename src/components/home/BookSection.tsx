import { commitments, finalCta } from "@/content/home";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env/public";
import { DemoForm } from "./DemoForm";

export function BookSection({ hasCalendly }: { hasCalendly: boolean }) {
  const next = [
    { when: "עכשיו", what: "שני שלבים קצרים: פרטי קשר, ואז קצת על העסק." },
    hasCalendly
      ? { when: "מיד אחרי", what: "בוחרים ביומן מועד שנוח לכם לדמו." }
      : { when: "עד יום העסקים הבא", what: "נציג מכירות חוזר אליכם לתאם מועד לדמו." },
    { when: "בדמו", what: `${site.demoMinutes} דקות אונליין עם נציג. רואים את הבוט עובד ושואלים כל שאלה.` },
  ];

  return (
    <section id="book" className="relative scroll-mt-20 border-t border-night-800 py-24 md:py-32" aria-labelledby="book-title">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-teal-600/10 to-transparent"
      />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-small font-medium text-teal-300">תיאום דמו</p>
          <h2 id="book-title" className="mt-4 text-h2 font-bold text-balance">
            {finalCta.heading}
          </h2>
          <p className="mt-5 text-lead text-mist-300">{finalCta.body}</p>

          <ol className="mt-10 flex flex-col gap-5 border-s border-night-700 ps-6">
            {next.map((item) => (
              <li key={item.when} className="relative">
                <span className="absolute -start-7.5 top-2 size-2.5 rounded-full bg-teal-400" aria-hidden="true" />
                <p className="text-small font-semibold text-mist-100">{item.when}</p>
                <p className="text-small text-mist-400">{item.what}</p>
              </li>
            ))}
          </ol>

          <ul className="mt-10 flex flex-col gap-4 rounded-card border border-night-700 bg-night-900/60 p-5 md:p-6">
            {commitments.items.map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal-400/15 text-teal-300" aria-hidden="true">
                  <svg viewBox="0 0 20 20" className="size-3.5">
                    <path d="m5 10.5 3.2 3L15 6.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div>
                  <p className="text-small font-semibold text-mist-100">{item.title}</p>
                  <p className="mt-1 text-small text-mist-400">{item.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="lg:col-span-7">
          <DemoForm hasCalendly={hasCalendly} turnstileSiteKey={publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null} />
        </div>
      </div>
    </section>
  );
}
