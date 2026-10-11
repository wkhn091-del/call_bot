import type { CSSProperties } from "react";
import { nightVoices } from "@/content/home";

function Phrases() {
  return (
    <>
      {nightVoices.phrases.map((phrase) => (
        <li
          key={phrase}
          className="flex shrink-0 items-center gap-3 rounded-full border border-night-700 bg-night-900/70 px-5 py-3 text-body text-mist-300"
        >
          <span className="size-1.5 rounded-full bg-teal-400" aria-hidden="true" />
          {phrase}
        </li>
      ))}
    </>
  );
}

/**
 * A10 marquee band (motion-kit, CSS only). Answers "does it really get how we talk?" before the
 * calculator. The second copy exists only for a seamless loop and is hidden from assistive tech.
 */
export function NightVoices() {
  return (
    <section className="border-t border-night-800 py-10 md:py-14" aria-label={nightVoices.label}>
      <p className="mx-auto max-w-7xl px-5 text-small font-medium text-mist-500 md:px-8">{nightVoices.label}</p>
      <div className="marquee mt-5" style={{ "--marquee-duration": "70s" } as CSSProperties}>
        <div className="marquee__track">
          <ul className="marquee__group">
            <Phrases />
          </ul>
          <ul className="marquee__group" aria-hidden="true" inert>
            <Phrases />
          </ul>
        </div>
      </div>
    </section>
  );
}
