import Image from "next/image";
import { Magnetic } from "@/components/motion/Magnetic";
import { CtaLink } from "@/components/ui/CtaLink";
import { commitments, hero } from "@/content/home";
import { HeroCallCard } from "./HeroCallCard";

type FactIconName = (typeof hero.facts)[number]["icon"];

function FactIcon({ name }: { name: FactIconName }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "size-5",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  } as const;

  if (name === "voice") {
    return (
      <svg {...common}>
        <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" />
      </svg>
    );
  }
  if (name === "crm") {
    return (
      <svg {...common}>
        <rect x="3" y="4" width="18" height="16" rx="3" />
        <path d="M3 10h18M9 10v10" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M5 4h14v16l-3-2-2 2-2-2-2 2-2-2-3 2z" />
      <path d="M9 9h6M9 13h4" />
    </svg>
  );
}

export function Hero({ hasCalendly }: { hasCalendly: boolean }) {
  return (
    <section className="relative -mt-16 flex min-h-svh flex-col overflow-hidden" aria-labelledby="hero-title">
      <Image
        src="/hero/night-garage.webp"
        alt={hero.imageAlt}
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "30% 65%" }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-night-950/55 lg:hidden" />
      <div aria-hidden="true" className="absolute inset-0 hidden bg-linear-to-l from-night-950 via-night-950/75 to-night-950/0 lg:block" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-night-950 via-night-950/70 to-transparent" />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-night-950/80 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-10 pt-24 md:px-8 lg:pt-32">
        <div className="flex max-w-2xl flex-col">
          <p className="flex items-center gap-3 text-small font-medium text-mist-300">
            <bdi dir="ltr" className="font-latin font-semibold tabular-nums text-teal-300">
              {hero.eyebrowTime}
            </bdi>
            <span className="h-px w-8 bg-mist-100/25" aria-hidden="true" />
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="mt-6 text-display font-extrabold text-balance">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lead text-mist-300 text-pretty max-sm:order-1">{hero.subtitle}</p>

          <div className="mt-7 flex flex-col items-stretch gap-3 sm:mt-9 sm:flex-row sm:items-center sm:gap-4">
            <Magnetic className="flex">
              <CtaLink id="hero-cta" href="#book" className="min-h-14 flex-1 px-7 text-lead">
                {hero.cta}
              </CtaLink>
            </Magnetic>
            <CtaLink href="#demo" variant="ghost" className="min-h-14 bg-night-950/40 backdrop-blur-sm">
              {hero.secondary}
            </CtaLink>
          </div>
          <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-small text-mist-300">
            {commitments.ctaNote(hasCalendly).map((item) => (
              <li key={item} className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" className="size-4 shrink-0 text-teal-300" aria-hidden="true">
                  <path d="m5 10.5 3.2 3L15 6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 lg:absolute lg:left-8 lg:top-1/4 lg:mt-0 xl:left-1/12">
          <HeroCallCard />
          <p className="mt-2 text-micro text-mist-500">{hero.disclaimer}</p>
        </div>
      </div>

      <div className="relative bg-night-950/70 backdrop-blur-md">
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-teal-400/60 to-transparent"
        />
        <ul className="mx-auto grid max-w-7xl gap-2 px-5 py-4 md:grid-cols-3 md:gap-4 md:px-8 md:py-7">
          {hero.facts.map((fact) => (
            <li
              key={fact.title}
              className="group flex items-center gap-4 rounded-card border border-mist-100/8 bg-night-900/50 p-4 transition-colors duration-300 hover:border-teal-400/30 max-md:py-3 md:p-5"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-full border border-teal-400/25 bg-teal-400/10 text-teal-300 shadow-[0_0_24px_-6px] shadow-teal-400/50">
                <FactIcon name={fact.icon} />
              </span>
              <span className="flex flex-col">
                <span className="text-body font-semibold text-mist-100">{fact.title}</span>
                <span className="text-small text-mist-400">{fact.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
