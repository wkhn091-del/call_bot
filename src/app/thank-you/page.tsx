import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { z } from "zod";
import { CtaLink } from "@/components/ui/CtaLink";
import type { DemoCall } from "@/content/calls";
import { site } from "@/content/site";
import { publicEnv } from "@/lib/env/public";
import { INDUSTRIES, type IndustryId } from "@/lib/leads/options";

export const metadata: Metadata = {
  title: "קיבלנו, נתראה בדמו",
  robots: { index: false, follow: false },
};

const demoCookieSchema = z.object({
  firstName: z
    .string()
    .max(60)
    .regex(/^[\p{L}\p{M}' .\-״׳"]+$/u),
  email: z.email().max(120),
  industry: z
    .enum(INDUSTRIES.map((industry) => industry.id) as [IndustryId, ...IndustryId[]])
    .optional()
    .catch(undefined),
});

const CALL_FOR_INDUSTRY: Partial<Record<IndustryId, { id: DemoCall["id"]; from: string }>> = {
  garage: { id: "garage", from: "ממוסך" },
  clinic: { id: "clinic", from: "ממרפאה" },
  realestate: { id: "realestate", from: "ממשרד נדל״ן" },
};

const PREPARE = [
  {
    key: "crm",
    content: (
      <>
        באיזו מערכת אתם מנהלים לידים או תורים: <bdi dir="ltr">Monday</bdi>, <bdi dir="ltr">Powerlink</bdi> או מערכת אחרת
      </>
    ),
  },
  { key: "hours", content: "באילו שעות ובאילו ימים אין אצלכם מי שיענה" },
  { key: "questions", content: "מה לקוח בדרך כלל שואל כשהוא מתקשר" },
];

async function readDemoCookie() {
  const raw = (await cookies()).get("cb_demo")?.value;
  if (!raw) return null;
  try {
    const parsed = demoCookieSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

function calendlySrc(base: string, person: { firstName: string; email: string } | null): string {
  const url = new URL(base);
  url.searchParams.set("hide_gdpr_banner", "1");
  url.searchParams.set("embed_type", "Inline");
  url.searchParams.set("embed_domain", new URL(publicEnv.NEXT_PUBLIC_SITE_URL).host);
  if (person) {
    url.searchParams.set("name", person.firstName);
    url.searchParams.set("email", person.email);
  }
  return url.toString();
}

export default async function ThankYouPage() {
  const person = await readDemoCookie();
  const calendly = publicEnv.NEXT_PUBLIC_CALENDLY_URL;
  const matchedCall = person?.industry ? CALL_FOR_INDUSTRY[person.industry] : undefined;
  const shareText = encodeURIComponent(
    `מצאתי בוט קולי שעונה לשיחות של העסק כשאנחנו לא זמינים, בעברית, וקובע תורים. שווה להציץ: ${publicEnv.NEXT_PUBLIC_SITE_URL}`,
  );

  return (
    <section className="relative py-16 md:py-24">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-linear-to-b from-teal-600/10 to-transparent" />
      <div className="relative mx-auto max-w-5xl px-5 md:px-8">
        <span className="grid size-14 place-items-center rounded-full bg-teal-400 text-night-950" aria-hidden="true">
          <svg viewBox="0 0 20 20" className="size-6">
            <path d="m5 10.5 3.2 3L15 6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <h1 className="mt-6 text-h2 font-bold text-balance">
          {person ? `קיבלנו, ${person.firstName}.` : "קיבלנו את הפרטים."}{" "}
          {calendly ? "נשאר רק לבחור מועד." : "נציג יחזור אליכם לתאם את הדמו."}
        </h1>
        <p className="mt-4 max-w-2xl text-lead text-mist-300">
          {calendly
            ? `בחרו ביומן ${site.demoMinutes} דקות שנוחות לכם. ההזמנה תגיע למייל שהשארתם.`
            : `נחזור אליכם עד יום העסקים הבא. הדמו אורך ${site.demoMinutes} דקות, אונליין, בלי התחייבות.`}
        </p>

        {calendly ? (
          <div className="mt-10 overflow-hidden rounded-panel border border-night-700 bg-mist-100">
            <iframe
              src={calendlySrc(calendly, person)}
              title="בחירת מועד לדמו ביומן"
              className="h-176 w-full"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        ) : null}

        <div className="mt-12 rounded-card border border-night-700 bg-night-900 p-6">
          <h2 className="text-h3 font-semibold">מה כדאי להכין לדמו</h2>
          <p className="mt-2 text-small text-mist-400">
            לא חובה, אבל ככה ב-{site.demoMinutes} הדקות נראה את הבוט על המקרים של העסק שלכם.
          </p>
          <ul className="mt-5 flex flex-col gap-3">
            {PREPARE.map((item) => (
              <li key={item.key} className="flex gap-3 text-small text-mist-300">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-teal-400" aria-hidden="true" />
                <span>{item.content}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-night-700 bg-night-900 p-6">
            <h2 className="text-h3 font-semibold">יש עוד מישהו שמחליט איתכם?</h2>
            <p className="mt-2 text-small text-mist-400">שלחו לו את העמוד, כדי שיגיע לדמו עם אותן שאלות.</p>
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-11 items-center rounded-control border border-night-600 px-5 text-small font-medium text-mist-100 transition-colors duration-100 hover:bg-night-800"
            >
              לשליחה בוואטסאפ
            </a>
          </div>
          <div className="rounded-card border border-night-700 bg-night-900 p-6">
            {matchedCall ? (
              <>
                <h2 className="text-h3 font-semibold">רוצים לראות שיחה {matchedCall.from} לפני הדמו?</h2>
                <p className="mt-2 text-small text-mist-400">שיחה לדוגמה מהתחום שלכם, מהצלצול ועד הליד במערכת.</p>
                <CtaLink href={`/?call=${matchedCall.id}#demo`} variant="ghost" className="mt-5 min-h-11">
                  לשיחה {matchedCall.from}
                </CtaLink>
              </>
            ) : (
              <>
                <h2 className="text-h3 font-semibold">רוצים לראות עוד שיחה לפני הדמו?</h2>
                <p className="mt-2 text-small text-mist-400">יש שיחות לדוגמה ממוסך, ממרפאה וממשרד נדל״ן.</p>
                <CtaLink href="/#demo" variant="ghost" className="mt-5 min-h-11">
                  לשיחות לדוגמה
                </CtaLink>
              </>
            )}
          </div>
        </div>

        <p className="mt-10 text-small text-mist-500">
          <Link href="/" className="underline underline-offset-4 hover:text-mist-300">
            חזרה לעמוד הראשי
          </Link>
        </p>
      </div>
    </section>
  );
}
