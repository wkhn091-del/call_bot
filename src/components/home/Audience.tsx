import { audience } from "@/content/home";

export function Audience() {
  return (
    <section className="border-t border-night-800 py-12 md:py-16" aria-labelledby="audience-title">
      <div className="mx-auto max-w-2xl px-5 md:px-8">
        <div className="mb-5" data-reveal>
          <h2 id="audience-title" className="text-h3 font-semibold text-balance">
            {audience.heading}
          </h2>
          <p className="mt-2 text-body text-mist-400">{audience.intro}</p>
        </div>
        <ul className="divide-y divide-night-700 border-y border-night-700" data-reveal>
          {audience.segments.map((segment) => (
            <li key={segment.name} className="flex flex-col gap-0.5 py-3">
              <span className="text-body font-semibold text-mist-100">{segment.name}</span>
              <span className="text-small text-mist-400">{segment.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
