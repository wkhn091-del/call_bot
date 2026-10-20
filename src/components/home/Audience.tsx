import { audience } from "@/content/home";

export function Audience() {
  return (
    <section className="border-t border-night-800 py-16 md:py-24" aria-labelledby="audience-title">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="mb-8" data-reveal>
          <h2 id="audience-title" className="text-h3 font-semibold text-balance">
            {audience.heading}
          </h2>
          <p className="mt-3 text-body text-mist-400">{audience.intro}</p>
        </div>
        <ul className="divide-y divide-night-700 border-y border-night-700" data-reveal>
          {audience.segments.map((segment) => (
            <li key={segment.name} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <span className="text-lead font-semibold text-mist-100">{segment.name}</span>
              <span className="text-small text-mist-400">{segment.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
