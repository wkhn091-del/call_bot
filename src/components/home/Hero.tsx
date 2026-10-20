import Image from "next/image";
import { HeroEntrance } from "@/components/home/HeroEntrance";
import { Magnetic } from "@/components/motion/Magnetic";
import { CtaLink } from "@/components/ui/CtaLink";
import { commitments, hero } from "@/content/home";

export function Hero({ hasCalendly }: { hasCalendly: boolean }) {
  const notes = commitments.ctaNote(hasCalendly);

  return (
    <section className="relative -mt-16 isolate overflow-hidden" aria-labelledby="hero-title">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src="/hero/night-garage.webp"
          alt=""
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[55%_70%] opacity-35 md:object-[70%_65%] md:opacity-45"
        />
        <div className="absolute inset-0 bg-night-950/82 md:bg-night-950/75" />
        <div className="hero-ambient absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgb(78_205_196/0.2),transparent_55%)] md:bg-[radial-gradient(ellipse_at_80%_70%,rgb(78_205_196/0.22),transparent_52%)]" />
      </div>

      {/*
        Desktop: text left (~42%), robot right (~58%). Hebrew stays RTL inside copy.
        Mobile: justify-end — copy + CTA then character pinned to the floor.
      */}
      <div
        dir="ltr"
        className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end md:grid md:grid-cols-12 md:items-center md:justify-normal md:gap-6 md:px-8 md:pb-16 md:pt-28 lg:gap-8"
      >
        <div
          dir="rtl"
          className="hero-copy relative z-20 flex shrink-0 flex-col px-5 pb-1 pt-6 md:col-span-5 md:col-start-1 md:justify-center md:px-0 md:py-0"
        >
          <span className="hero-ghost font-latin" aria-hidden="true">
            {hero.ghostWord}
          </span>

          <HeroEntrance delay={0.12} y={6}>
            <p className="font-latin text-[0.8125rem] font-bold tracking-[0.14em] text-mist-100 md:text-small">
              {hero.brand}
            </p>
          </HeroEntrance>

          <HeroEntrance delay={0.2} y={8}>
            <p className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-micro font-medium tracking-[0.02em] text-mist-400 md:mt-3">
              <bdi dir="ltr" className="font-latin font-semibold tabular-nums text-teal-300">
                {hero.eyebrowTime}
              </bdi>
              <span className="h-px w-6 bg-mist-100/20" aria-hidden="true" />
              {hero.eyebrow}
            </p>
          </HeroEntrance>

          {/* H1: server HTML + CSS rise only (no opacity hide) — LCP safe */}
          <h1 id="hero-title" className="hero-title mt-3 font-extrabold text-balance md:mt-5">
            {hero.title}
          </h1>

          <HeroEntrance delay={0.28} y={8}>
            <p className="hero-lead mt-2.5 max-w-[22rem] text-pretty text-mist-200 md:mt-4 md:max-w-md">
              {hero.subtitle}
            </p>
          </HeroEntrance>

          <HeroEntrance delay={0.32} y={6}>
            <ul className="hero-facts mt-3.5 grid gap-2 md:mt-5">
              {hero.facts.map((fact) => (
                <li key={fact.title} className="flex items-baseline gap-2 text-micro text-mist-300 md:text-small">
                  <span className="mt-[0.35em] size-1 shrink-0 rounded-full bg-teal-400" aria-hidden="true" />
                  <span>
                    <span className="font-semibold text-mist-100">{fact.title}</span>
                    <span className="text-mist-100/30"> · </span>
                    <span>{fact.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </HeroEntrance>

          <HeroEntrance delay={0.36} y={8} className="mt-5 md:mt-7">
            <div className="flex w-full flex-col gap-2.5 sm:flex-row sm:items-center md:gap-3">
              <Magnetic className="flex w-full sm:w-auto" strength={0.18}>
                <CtaLink
                  id="hero-cta"
                  href="#book"
                  className="hero-cta min-h-12 w-full px-7 text-small md:min-h-14 md:px-8 md:text-body"
                >
                  {hero.cta}
                </CtaLink>
              </Magnetic>
              <CtaLink
                href="#demo"
                variant="ghost"
                className="min-h-12 w-full px-6 text-small sm:w-auto md:min-h-14 md:text-body"
              >
                {hero.secondary}
              </CtaLink>
            </div>

            <p className="mt-2.5 text-micro text-mist-400 md:mt-3">
              {notes.map((item, i) => (
                <span key={item}>
                  {i > 0 ? (
                    <span className="mx-1.5 text-mist-100/25" aria-hidden="true">
                      ·
                    </span>
                  ) : null}
                  {item}
                </span>
              ))}
            </p>
          </HeroEntrance>
        </div>

        <div className="hero-character relative z-0 h-[38svh] w-full shrink-0 md:col-span-7 md:col-start-6 md:row-start-1 md:h-[min(78svh,40rem)] md:self-end md:-ms-4 lg:-ms-6">
          <div className="hero-character__glow" aria-hidden="true" />
          <div className="hero-character__stage relative mx-auto h-full w-full max-w-[17rem] md:max-w-none">
            <Image
              src="/hero/callbot-robot.png"
              alt={hero.imageAlt}
              fill
              unoptimized
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 58vw"
              className="hero-character__img object-contain object-bottom"
            />
          </div>
        </div>
      </div>

      <p
        dir="rtl"
        className="relative z-10 mx-auto hidden w-full max-w-7xl px-5 pb-3 text-center text-[0.6875rem] text-mist-500 md:block md:px-8 md:pb-4 md:text-start"
      >
        {hero.disclaimer}
      </p>
    </section>
  );
}
