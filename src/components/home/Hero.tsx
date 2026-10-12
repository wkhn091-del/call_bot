import Image from "next/image";
import { Magnetic } from "@/components/motion/Magnetic";
import { CtaLink } from "@/components/ui/CtaLink";
import { commitments, hero } from "@/content/home";

export function Hero({ hasCalendly }: { hasCalendly: boolean }) {
  return (
    <section className="relative -mt-16 isolate overflow-hidden" aria-labelledby="hero-title">
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <Image
          src="/hero/night-garage.webp"
          alt=""
          fill
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[70%_65%] opacity-45"
        />
        <div className="absolute inset-0 bg-night-950/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_85%_70%,rgb(78_205_196/0.22),transparent_52%)]" />
      </div>

      {/*
        Visual layout is LTR (copy left, character right). Hebrew copy stays RTL.
        On phones the character sits under the copy so the first screen already shows the bot.
      */}
      <div
        dir="ltr"
        className="relative mx-auto grid min-h-svh max-w-7xl md:grid-cols-12 md:items-end md:gap-6 md:px-8 md:pb-14 md:pt-28 lg:items-center"
      >
        <div
          dir="rtl"
          className="relative z-20 col-span-12 flex flex-col px-5 pb-[42svh] pt-24 md:col-span-5 md:px-0 md:pb-8 md:pt-0 lg:col-span-5"
        >
          <p className="flex flex-wrap items-center gap-3 text-small font-medium text-mist-300">
            <bdi dir="ltr" className="font-latin font-semibold tabular-nums text-teal-300">
              {hero.eyebrowTime}
            </bdi>
            <span className="h-px w-8 bg-mist-100/25" aria-hidden="true" />
            {hero.eyebrow}
          </p>

          <p className="mt-4 font-latin text-micro font-bold tracking-[0.28em] text-teal-300">CALLBOT</p>

          <h1 id="hero-title" className="hero-title mt-2 font-extrabold text-balance">
            {hero.title}
          </h1>
          <p className="mt-4 max-w-md text-body text-mist-300 text-pretty md:max-w-lg">{hero.subtitle}</p>

          <Magnetic className="mt-7 flex w-full sm:inline-flex sm:w-auto">
            <CtaLink id="hero-cta" href="#book" className="min-h-12 flex-1 px-8 text-body sm:min-h-14 sm:px-10">
              {hero.cta}
            </CtaLink>
          </Magnetic>

          <ul className="mt-4 flex flex-col gap-1.5 text-small text-mist-300 sm:mt-5 sm:gap-2">
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

        <div className="hero-character pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[48svh] md:pointer-events-auto md:relative md:inset-auto md:col-span-7 md:h-[min(88svh,48rem)] md:-mb-8">
          <div className="hero-character__glow" aria-hidden="true" />
          <div className="hero-character__stage relative h-full w-full">
            <Image
              src="/hero/callbot-robot.png"
              alt={hero.imageAlt}
              fill
              unoptimized
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 58vw"
              className="hero-character__img object-contain object-bottom object-right md:object-center"
            />
          </div>

          <div className="hero-phone-mark pointer-events-none absolute top-[18%] left-[8%] hidden md:block" aria-hidden="true">
            <span className="hero-ring" />
            <span className="hero-ring" />
            <span className="hero-ring" />
            <span className="hero-answered rounded-chip border border-teal-400/45 bg-night-950/85 px-3 py-1.5 text-micro font-medium text-mist-100 backdrop-blur-md">
              <bdi dir="ltr" className="font-latin tabular-nums text-teal-300">
                {hero.eyebrowTime}
              </bdi>{" "}
              · CALLBOT ענה
            </span>
          </div>
        </div>
      </div>

      <p dir="rtl" className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-5 text-micro text-mist-500 md:px-8">
        {hero.disclaimer}
      </p>
    </section>
  );
}
