import type { Metadata } from "next";
import Link from "next/link";
import { Faq } from "@/components/home/Faq";
import { CtaLink } from "@/components/ui/CtaLink";
import { included, PRICES_INCLUDE_VAT, pricingFaq, tiers } from "@/content/pricing";

export const metadata: Metadata = {
  title: "תמחור לפי שיחה, בלי מנוי חודשי",
  description: "CALLBOT מתומחר לפי שיחה, בלי מנוי חודשי קבוע. בחודש שקט משלמים פחות. הצעת מחיר מדויקת בדמו של 15 דקות.",
};

const shekel = new Intl.NumberFormat("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export default function PricingPage() {
  return (
    <>
      <section className="relative overflow-hidden py-20 md:py-28" aria-labelledby="pricing-title">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-full bg-linear-to-b from-night-800/60 to-night-950" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="text-small font-medium text-teal-300">תמחור</p>
            <h1 id="pricing-title" className="mt-4 text-display font-extrabold text-balance">
              משלמים על שיחות, לא על חודשים.
            </h1>
            <p className="mt-6 max-w-xl text-lead text-mist-300">
              אין מנוי חודשי קבוע. משלמים לפי שיחה שהבוט ענה עליה, כך שבחודש שקט החשבון קטן יותר.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CtaLink href="/#book" className="min-h-14 px-7 text-lead">
                להצעת מחיר בדמו של 15 דקות
              </CtaLink>
            </div>
            <p className="mt-4 text-small text-mist-400">דמו אונליין עם נציג · בלי התחייבות</p>
          </div>

          <div className="lg:col-span-6">
            {tiers.length > 0 ? (
              <ul className="grid gap-4">
                {tiers.map((tier) => (
                  <li key={tier.name} className="rounded-panel border border-night-700 bg-night-900 p-6">
                    <p className="text-small font-semibold text-mist-300">{tier.name}</p>
                    <p className="mt-2 text-h2 font-bold">
                      <bdi dir="ltr" className="font-latin tabular-nums">
                        ₪{shekel.format(tier.pricePerCall)}
                      </bdi>{" "}
                      <span className="text-body font-normal text-mist-400">
                        לשיחה {PRICES_INCLUDE_VAT ? "כולל מע״מ" : "לפני מע״מ"}
                      </span>
                    </p>
                    {tier.minimumMonthly !== null ? (
                      <p className="mt-1 text-small text-mist-400">
                        מינימום חודשי:{" "}
                        <bdi dir="ltr" className="font-latin tabular-nums">
                          ₪{shekel.format(tier.minimumMonthly)}
                        </bdi>
                      </p>
                    ) : null}
                    <p className="mt-3 text-small text-mist-300">{tier.note}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-panel border border-night-700 bg-night-900 p-6 md:p-8">
                <h2 className="text-h3 font-semibold">מה כלול בכל שיחה</h2>
                <ul className="mt-6 flex flex-col gap-4">
                  {included.map((item) => (
                    <li key={item} className="flex gap-3 text-body text-mist-300">
                      <svg viewBox="0 0 20 20" className="mt-1.5 size-4 shrink-0 text-teal-400" aria-hidden="true">
                        <path d="m4.5 10.5 3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 rounded-card bg-night-950/70 p-5">
                  <p className="text-small text-mist-300">
                    רוצים לדעת כמה עולות לכם השיחות שלא נענות היום?{" "}
                    <Link href="/#hours" className="text-teal-300 underline underline-offset-4">
                      למחשבון השעות
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
      <Faq items={pricingFaq} heading="שאלות על התמחור" />
    </>
  );
}
