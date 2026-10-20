import Link from "next/link";
import { commitments, hero } from "@/content/home";

/** Compact proof strip under the hero — real commitments only, no invented stats. */
export function TrustBand() {
  return (
    <section className="border-t border-night-800 bg-night-900/40" aria-label="למה סוגרים איתנו">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between md:gap-8 md:px-8 md:py-6">
        <ul className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-x-6 sm:gap-y-2">
          {commitments.items.map((item) => (
            <li key={item.title} className="flex items-center gap-2 text-small text-mist-300">
              <span className="size-1.5 shrink-0 rounded-full bg-teal-400" aria-hidden="true" />
              <span className="font-medium text-mist-100">{item.title}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-small">
          <span className="text-mist-400">{hero.facts[2].title} · {hero.facts[2].body}</span>
          <Link
            href="/pricing"
            className="font-semibold text-teal-300 underline-offset-4 transition hover:text-teal-200 hover:underline"
          >
            איך עובד התמחור
          </Link>
        </div>
      </div>
    </section>
  );
}
