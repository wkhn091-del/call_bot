import Image from "next/image";
import { Magnetic } from "@/components/motion/Magnetic";
import { CtaLink } from "@/components/ui/CtaLink";
import { commitments, hero } from "@/content/home";

export function Hero({ hasCalendly }: { hasCalendly: boolean }) {
  return (
    <section className="relative -mt-16 flex min-h-svh flex-col overflow-hidden" aria-labelledby="hero-title">
      <div className="hero-frame absolute inset-0">
        <div className="hero-stage">
          <Image
            src="/hero/night-garage.webp"
            alt={hero.imageAlt}
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 768px) 180vh, 100vw"
            className="object-cover"
          />
          <div className="hero-phone hidden md:block" aria-hidden="true">
            <span className="hero-ring" />
            <span className="hero-ring" />
            <span className="hero-answered rounded-chip border border-teal-400/40 bg-night-950/80 px-3 py-1.5 text-micro font-medium text-mist-100 backdrop-blur-md">
              <bdi dir="ltr" className="font-latin tabular-nums text-teal-300">
                {hero.eyebrowTime}
              </bdi>{" "}
              · CALLBOT ענה ללקוח
            </span>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="absolute inset-0 bg-night-950/65 md:hidden" />
      <div aria-hidden="true" className="absolute inset-0 hidden bg-linear-to-l from-night-950 via-night-950/80 to-night-950/0 md:block" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-night-950 to-transparent" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-16 pt-28 md:px-8">
        <div className="max-w-2xl">
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
          <p className="mt-6 max-w-xl text-lead text-mist-300 text-pretty">{hero.subtitle}</p>

          <Magnetic className="mt-10 flex w-full sm:inline-flex sm:w-auto">
            <CtaLink id="hero-cta" href="#book" className="min-h-14 flex-1 px-8 text-lead">
              {hero.cta}
            </CtaLink>
          </Magnetic>
          <p className="mt-4 text-small text-mist-400">{commitments.ctaNote(hasCalendly).join(" · ")}</p>
        </div>
      </div>

      <p className="relative mx-auto w-full max-w-7xl px-5 pb-5 text-micro text-mist-500 md:px-8">{hero.disclaimer}</p>
    </section>
  );
}
