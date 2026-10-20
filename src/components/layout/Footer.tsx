import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CtaLink } from "@/components/ui/CtaLink";
import { site } from "@/content/site";

const linkClass =
  "text-small text-mist-400 transition-colors duration-100 hover:text-mist-100";

const LEGAL_LINKS = [
  { href: "/accessibility", label: "הצהרת נגישות" },
  { href: "/privacy", label: "מדיניות פרטיות" },
] as const;

export function Footer() {
  const { legal, contact } = site;

  return (
    <footer className="border-t border-night-800 bg-night-950 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:pb-0">
      {/* Pre-footer CTA — one strip, not a card */}
      <div className="border-b border-night-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 md:flex-row md:items-center md:justify-between md:gap-8 md:px-8 md:py-10">
          <div className="min-w-0 md:max-w-xl">
            <p className="font-latin text-micro font-semibold tabular-nums text-teal-300" dir="ltr">
              21:40
            </p>
            <p className="mt-1 text-lead font-semibold text-mist-100 text-balance">
              הטלפון של העסק יצלצל גם הלילה. מי יענה לו?
            </p>
          </div>
          <CtaLink href="/#book" className="min-h-12 w-full shrink-0 px-6 text-small md:w-auto">
            לתיאום דמו של {site.demoMinutes} דקות
          </CtaLink>
        </div>
      </div>

      {/* Classic footer grid */}
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 md:grid-cols-12 md:gap-8 md:px-8 md:py-14">
        <div className="md:col-span-5 lg:col-span-6">
          <Logo />
          <p className="mt-4 max-w-sm text-small leading-relaxed text-mist-500">
            מוצר של <bdi dir="ltr">{site.company}</bdi>. בוט קולי שעונה לשיחות של העסק כשאתם לא
            זמינים.
          </p>
        </div>

        <nav aria-label="ניווט בתחתית" className="md:col-span-3 lg:col-span-3">
          <p className="text-micro font-semibold text-mist-300">באתר</p>
          <ul className="mt-4 flex flex-col gap-3">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4 lg:col-span-3">
          <p className="text-micro font-semibold text-mist-300">מידע</p>
          <ul className="mt-4 flex flex-col gap-3">
            {LEGAL_LINKS.map((item) => (
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
          </ul>
        </div>
      </div>

      {/* Copyright bar */}
      <div className="border-t border-night-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-5 text-micro text-mist-400 md:flex-row md:px-8">
          <p>
            <bdi dir="ltr">
              © {new Date().getFullYear()} {legal.legalName ?? site.company}
            </bdi>
          </p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {legal.companyId ? (
              <span>
                ח.פ <bdi dir="ltr">{legal.companyId}</bdi>
              </span>
            ) : null}
            {legal.address ? <span>{legal.address}</span> : null}
            {contact.salesPhone ? (
              <a href={`tel:${contact.salesPhone.replace(/\D/g, "")}`} className="hover:text-mist-100">
                <bdi dir="ltr">{contact.salesPhone}</bdi>
              </a>
            ) : null}
          </p>
        </div>
        {!legal.companyId || !legal.address ? (
          <p className="mx-auto max-w-7xl px-5 pb-5 text-center text-micro text-mist-500 md:px-8 md:text-start">
            חסרים ח.פ וכתובת רשומה — להשלים ב־site.ts לפני השקה מסחרית.
          </p>
        ) : null}
      </div>
    </footer>
  );
}
