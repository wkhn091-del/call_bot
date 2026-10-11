import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { site } from "@/content/site";

export function Footer() {
  const { legal, contact } = site;
  return (
    <footer className="border-t border-night-700/60 bg-night-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-3 md:px-8">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-small text-mist-400">
            מוצר של <bdi dir="ltr">{site.company}</bdi>. בוט קולי שעונה לשיחות של העסק כשאתם לא זמינים.
          </p>
        </div>

        <div className="space-y-3 text-small">
          <h2 className="font-semibold text-mist-100">דברו איתנו</h2>
          <ul className="space-y-2 text-mist-300">
            <li>
              <Link href="/#book" className="hover:text-mist-100">
                תיאום דמו של {site.demoMinutes} דקות
              </Link>
            </li>
            {contact.salesPhone ? (
              <li>
                <a href={`tel:${contact.salesPhone.replace(/\D/g, "")}`} className="hover:text-mist-100">
                  <bdi dir="ltr">{contact.salesPhone}</bdi>
                </a>
              </li>
            ) : null}
            {contact.salesEmail ? (
              <li>
                <a href={`mailto:${contact.salesEmail}`} className="hover:text-mist-100">
                  <bdi dir="ltr">{contact.salesEmail}</bdi>
                </a>
              </li>
            ) : null}
            {contact.hours ? <li className="text-mist-400">{contact.hours}</li> : null}
          </ul>
        </div>

        <div className="space-y-3 text-small">
          <h2 className="font-semibold text-mist-100">מידע</h2>
          <ul className="space-y-2 text-mist-300">
            <li>
              <Link href="/pricing" className="hover:text-mist-100">
                תמחור
              </Link>
            </li>
            <li>
              <Link href="/accessibility" className="hover:text-mist-100">
                הצהרת נגישות
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-mist-100">
                מדיניות פרטיות
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-night-700/60">
        <p className="mx-auto max-w-7xl px-5 py-6 text-micro text-mist-500 md:px-8">
          © {new Date().getFullYear()} {legal.legalName ?? site.company}
          {legal.companyId ? <> · ח.פ <bdi dir="ltr">{legal.companyId}</bdi></> : null}
          {legal.address ? <> · {legal.address}</> : null}
        </p>
      </div>
    </footer>
  );
}
