import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Magnetic } from "@/components/motion/Magnetic";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { CtaLink } from "@/components/ui/CtaLink";
import { site } from "@/content/site";

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-night-700/60 bg-night-950/80 backdrop-blur-md">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-3 focus:z-50 focus:rounded-chip focus:bg-teal-400 focus:px-4 focus:py-2 focus:text-night-950"
      >
        לדלג לתוכן
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/" aria-label={`${site.brand}, לעמוד הבית`}>
          <Logo />
        </Link>
        <nav aria-label="ניווט ראשי" className="hidden md:block">
          <ul className="flex items-center gap-8 text-small text-mist-300">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition-colors duration-100 hover:text-mist-100">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Magnetic className="flex shrink-0" strength={0.2}>
          <CtaLink href="/#book" className="min-h-10 whitespace-nowrap px-4 text-small">
            לתיאום דמו
          </CtaLink>
        </Magnetic>
      </div>
      <ScrollProgress />
    </header>
  );
}
