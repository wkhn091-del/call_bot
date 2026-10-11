import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { CtaLink } from "@/components/ui/CtaLink";
import { site } from "@/content/site";

const linkClass =
  "inline-flex min-h-10 items-center text-mist-300 transition-colors duration-100 hover:text-mist-100";

const INFO_LINKS = [
  { href: "/pricing", label: "תמחור" },
  { href: "/accessibility", label: "הצהרת נגישות" },
  { href: "/privacy", label: "מדיניות פרטיות" },
] as const;

export function Footer() {
  const { legal, contact } = site;
  return (
    <footer className="relative overflow-hidden border-t border-night-700/60 bg-night-950">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-teal-400/50 to-transparent"
      />

      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col gap-6 border-b border-night-700/60 py-12 md:flex-row md:items-center md:justify-between md:py-14">
          <div>
            <p className="font-latin text-small font-semibold tabular-nums text-teal-300" dir="ltr">
              21:40
            </p>
            <p className="mt-2 max-w-md text-h3 font-semibold text-balance text-mist-100">
              הטלפון של העסק יצלצל גם הלילה. מי יענה לו?
            </p>
          </div>
          <CtaLink href="/#book" className="self-start md:self-auto">
            לתיאום דמו של {site.demoMinutes} דקות
          </CtaLink>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 md:grid-cols-12">
          <div className="col-span-2 md:col-span-6">
            <Logo />
            <p className="mt-4 max-w-xs text-small text-mist-400">
              מוצר של <bdi dir="ltr">{site.company}</bdi>. בוט קולי שעונה לשיחות של העסק כשאתם לא זמינים.
            </p>
          </div>

          <nav aria-label="ניווט בתחתית" className="text-small md:col-span-3">
            <h2 className="text-micro font-semibold text-mist-500">באתר</h2>
            <ul className="mt-3">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={linkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-small md:col-span-3">
            <h2 className="text-micro font-semibold text-mist-500">מידע ויצירת קשר</h2>
            <ul className="mt-3">
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
              {contact.hours ? <li className="py-2 text-mist-400">{contact.hours}</li> : null}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-night-700/60">
        <p className="mx-auto max-w-7xl px-5 py-6 text-micro text-mist-500 md:px-8">
          <bdi dir="ltr">
            © {new Date().getFullYear()} {legal.legalName ?? site.company}
          </bdi>
          {legal.companyId ? <> · ח.פ <bdi dir="ltr">{legal.companyId}</bdi></> : null}
          {legal.address ? <> · {legal.address}</> : null}
        </p>
      </div>
    </footer>
  );
}
