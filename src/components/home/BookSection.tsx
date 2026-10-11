import { commitments, finalCta } from "@/content/home";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env/public";
import { DemoForm } from "./DemoForm";

/** Shown instead of the form while the server refuses leads. Lists only contact routes that are actually configured. */
function BookingClosed() {
  const { salesPhone, salesEmail, hours } = site.contact;
  const calendly = publicEnv.NEXT_PUBLIC_CALENDLY_URL;
  const hasRoute = Boolean(calendly || salesPhone || salesEmail);

  return (
    <div className="rounded-panel border border-night-700 bg-night-900 p-6 shadow-panel md:p-8">
      <p className="text-small font-semibold text-teal-300">תיאום דרך האתר ייפתח בקרוב</p>
      <h3 className="mt-3 text-h3 font-bold text-mist-100">
        {hasRoute ? "בינתיים אפשר לתאם את הדמו ישירות" : "הטופס עוד לא פתוח לפניות"}
      </h3>
      <p className="mt-3 text-body text-mist-300">
        {hasRoute
          ? "הטופס באתר עוד לא מחובר. כדי לא לאבד את הפנייה שלכם, הנה הדרכים שבהן היא מגיעה אלינו כבר היום."
          : "אנחנו מסיימים לחבר את הטופס למערכת שלנו. עד אז הוא לא מקבל פרטים, כך שאף פנייה לא הולכת לאיבוד בדרך."}
      </p>

      {hasRoute ? (
        <ul className="mt-6 flex flex-col gap-3">
          {calendly ? (
            <li>
              <a
                href={calendly}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-14 w-full items-center justify-center rounded-control bg-teal-400 px-6 text-lead font-semibold text-night-950 shadow-cta transition duration-100 hover:bg-teal-300"
              >
                לבחירת מועד ביומן
                <span className="sr-only"> (נפתח בלשונית חדשה)</span>
              </a>
            </li>
          ) : null}
          {salesPhone ? (
            <li className="rounded-control border border-night-700 px-4 py-3 text-body">
              טלפון:{" "}
              <a href={`tel:${salesPhone.replace(/[^\d+]/g, "")}`} className="text-teal-300 underline underline-offset-4">
                <bdi dir="ltr">{salesPhone}</bdi>
              </a>
            </li>
          ) : null}
          {salesEmail ? (
            <li className="rounded-control border border-night-700 px-4 py-3 text-body">
              מייל:{" "}
              <a href={`mailto:${salesEmail}`} className="text-teal-300 underline underline-offset-4">
                <bdi dir="ltr">{salesEmail}</bdi>
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
      {hasRoute && hours ? <p className="mt-4 text-small text-mist-500">שעות מענה: {hours}</p> : null}
    </div>
  );
}

export function BookSection({ hasCalendly, locked }: { hasCalendly: boolean; locked: boolean }) {
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

          {locked ? null : (
            <ol className="mt-10 flex flex-col gap-5 border-s border-night-700 ps-6">
              {next.map((item) => (
                <li key={item.when} className="relative">
                  <span className="absolute -start-7.5 top-2 size-2.5 rounded-full bg-teal-400" aria-hidden="true" />
                  <p className="text-small font-semibold text-mist-100">{item.when}</p>
                  <p className="text-small text-mist-400">{item.what}</p>
                </li>
              ))}
            </ol>
          )}

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
          {locked ? (
            <BookingClosed />
          ) : (
            <DemoForm hasCalendly={hasCalendly} turnstileSiteKey={publicEnv.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null} />
          )}
        </div>
      </div>
    </section>
  );
}
