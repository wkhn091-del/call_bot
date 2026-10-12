import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CtaLink } from "@/components/ui/CtaLink";
import { site } from "@/content/site";

const linkClass =
  "inline-flex min-h-9 items-center text-small text-mist-300 transition-colors duration-100 hover:text-mist-100 md:min-h-8 md:text-micro";

const INFO_LINKS = [
  { href: "/pricing", label: "תמחור" },
  { href: "/accessibility", label: "הצהרת נגישות" },
  { href: "/privacy", label: "מדיניות פרטיות" },
] as const;

export function Footer() {
  const { legal, contact } = site;
  return (
    <footer className="relative overflow-hidden bg-night-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 md:px-8 md:py-10">
        <div className="overflow-hidden rounded-3xl bg-night-900/70 ring-1 ring-mist-100/10 shadow-[0_0_0_1px_rgb(78_205_196/0.06)]">
          {/* Closing CTA band */}
          <div className="flex flex-col gap-4 border-b border-mist-100/8 bg-night-950/35 px-5 py-5 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-8 md:px-8 md:py-6">
            <div className="min-w-0 md:max-w-lg">
              <p className="font-latin text-micro font-semibold tabular-nums text-teal-300" dir="ltr">
                21:40
              </p>
              <p className="mt-1 text-body font-semibold leading-snug text-balance text-mist-100">
                הטלפון של העסק יצלצל גם הלילה. מי יענה לו?
              </p>
            </div>
            <CtaLink
              href="/#book"
              className="min-h-12 w-full shrink-0 px-6 text-small md:w-auto md:min-h-11"
            >
              לתיאום דמו של {site.demoMinutes} דקות
            </CtaLink>
          </div>

          {/* Spread across the card: brand (start) · site · info (end) */}
          <div className="flex flex-col gap-7 px-5 py-6 sm:px-6 md:flex-row md:items-start md:justify-between md:gap-10 md:px-8 md:py-8">
            <div className="max-w-[18rem] shrink-0">
              <Logo />
              <p className="mt-3 text-micro leading-relaxed text-mist-400">
                מוצר של <bdi dir="ltr">{site.company}</bdi>. בוט קולי שעונה לשיחות של העסק כשאתם לא
                זמינים.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-6 md:contents">
              <nav aria-label="ניווט בתחתית" className="min-w-[8rem] shrink-0">
                <h2 className="text-[0.6875rem] font-semibold tracking-wide text-mist-500">באתר</h2>
                <ul className="mt-2.5 flex flex-col">
                  {site.nav.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={linkClass}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="min-w-[8rem] shrink-0">
                <h2 className="text-[0.6875rem] font-semibold tracking-wide text-mist-500">מידע</h2>
                <ul className="mt-2.5 flex flex-col">
                  {INFO_LINKS.map((item) => (
                    <li key={item.href}>
                      <Link href={item.href} className={linkClass}>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  {contact.salesPhone ? (
                    <li>
                      <a href={`tel:${contact.salesPhone.replace(/\D/g, "")}`} className={linkClass}>
                        <bdi dir="ltr">{contact.salesPhone}</bdi>
                      </a>
                    </li>
                  ) : null}
                  {contact.salesEmail ? (
                    <li>
                      <a href={`mailto:${contact.salesEmail}`} className={linkClass}>
                        <bdi dir="ltr">{contact.salesEmail}</bdi>
                      </a>
                    </li>
                  ) : null}
                  {contact.hours ? <li className="pt-1 text-micro text-mist-500">{contact.hours}</li> : null}
                </ul>
              </div>
            </div>
          </div>

          {/* Copyright — centered at the bottom of the card */}
          <div className="border-t border-mist-100/8 px-5 py-3.5 sm:px-6 md:px-8">
            <p className="text-center text-micro text-mist-500">
              <bdi dir="ltr">
                © {new Date().getFullYear()} {legal.legalName ?? site.company}
              </bdi>
              {legal.companyId ? (
                <>
                  {" "}
                  · ח.פ <bdi dir="ltr">{legal.companyId}</bdi>
                </>
              ) : null}
              {legal.address ? <> · {legal.address}</> : null}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
