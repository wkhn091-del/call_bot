import Image from "next/image";
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
          loading="eager"
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[70%_65%] opacity-40 md:opacity-45"
        />
        <div className="absolute inset-0 bg-night-950/80 md:bg-night-950/75" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_85%,rgb(78_205_196/0.18),transparent_55%)] md:bg-[radial-gradient(ellipse_at_85%_70%,rgb(78_205_196/0.22),transparent_52%)]" />
      </div>

      <div
        dir="ltr"
        className="relative mx-auto grid min-h-[100svh] max-w-7xl max-md:content-start md:grid-cols-12 md:items-center md:gap-8 md:px-8 md:pb-16 md:pt-28"
      >
        {/*
          Mobile: compact copy block under the nav, robot rises into the lower half —
          one dense composition, not a sparse top strip with empty air.
        */}
        <div
          dir="rtl"
          className="hero-copy relative z-20 col-span-12 flex flex-col px-5 pt-20 pb-[38svh] md:col-span-5 md:justify-center md:px-0 md:py-0 lg:col-span-5"
        >
          <p className="flex items-center gap-2.5 text-micro font-medium text-mist-400">
            <bdi dir="ltr" className="font-latin font-semibold tabular-nums text-teal-300">
              {hero.eyebrowTime}
            </bdi>
            <span className="h-px w-6 bg-mist-100/20" aria-hidden="true" />
            {hero.eyebrow}
          </p>

          <h1 id="hero-title" className="hero-title mt-3 font-extrabold text-balance md:mt-5">
            {hero.title}
          </h1>

          <p className="mt-2.5 max-w-[17rem] text-small leading-snug text-mist-300 text-pretty sm:max-w-xs md:mt-3 md:max-w-sm md:leading-relaxed">
            {hero.subtitle}
          </p>

          <Magnetic className="mt-5 flex w-full max-w-[17rem] sm:inline-flex sm:w-auto md:mt-7 md:max-w-xs">
            <CtaLink id="hero-cta" href="#book" className="min-h-12 w-full flex-1 px-7 text-small sm:w-auto sm:px-8 md:min-h-14 md:text-body">
              {hero.cta}
            </CtaLink>
          </Magnetic>

          <p className="mt-2.5 text-micro text-mist-400 md:mt-3">
            {notes.map((item, i) => (
              <span key={item}>
                {i > 0 ? <span className="mx-1.5 text-mist-100/25" aria-hidden="true">·</span> : null}
                {item}
              </span>
            ))}
          </p>
        </div>

        <div className="hero-character pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[54svh] md:pointer-events-auto md:relative md:inset-auto md:col-span-7 md:h-[min(78svh,40rem)] md:self-end">
          <div className="hero-character__glow" aria-hidden="true" />
          <div className="hero-character__stage relative mx-auto h-full w-full max-w-[22rem] md:max-w-none">
            <Image
              src="/hero/callbot-robot.png"
              alt={hero.imageAlt}
              fill
              unoptimized
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 58vw"
              className="hero-character__img object-contain object-bottom"
            />
          </div>

          <div className="hero-phone-mark pointer-events-none absolute top-[14%] left-[6%] hidden md:block" aria-hidden="true">
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

      <p dir="rtl" className="relative z-10 mx-auto hidden w-full max-w-7xl px-5 pb-3 text-center text-[0.6875rem] text-mist-500 md:block md:px-8 md:pb-4 md:text-start">
        {hero.disclaimer}
      </p>
    </section>
  );
}
