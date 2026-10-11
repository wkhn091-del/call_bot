import type { CSSProperties } from "react";
import { comparison } from "@/content/home";

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
      <path d="m5 10.5 3.2 3L15 6.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Keeps a Hebrew prefix glued to the Latin word after it ("ב-Powerlink") so the line never breaks at the hyphen. */
function KeepPrefixed({ text }: { text: string }) {
  return text.split(/(\S+-[A-Za-z]\S*)/).map((part, i) =>
    i % 2 ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

/** Mobile: one card per question, CALLBOT's answer first. Cards stick and pile up while scrolling (motion-kit A30). */
function StackedCards() {
  return (
    <ol className="mt-10 flex flex-col gap-4 md:hidden">
      {comparison.rows.map((row, index) => (
        <li
          key={row.label}
          className="stack-card rounded-panel border border-night-700 bg-night-900 p-5 shadow-panel"
          style={{ "--stack-index": index } as CSSProperties}
        >
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-body font-bold text-mist-100">{row.label}</h3>
            <span className="font-latin text-micro tabular-nums text-mist-500" dir="ltr">
              {index + 1}/{comparison.rows.length}
            </span>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-card border border-teal-400/30 bg-teal-400/8 p-4">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-teal-400 text-night-950">
              <CheckIcon />
            </span>
            <div className="flex flex-col">
              <span className="font-latin text-micro font-bold tracking-wider text-teal-300">CALLBOT</span>
              <span className="text-body font-medium text-mist-100">
                <KeepPrefixed text={row.callbot} />
              </span>
            </div>
          </div>

          <dl className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-card bg-night-950/60 p-3">
              <dt className="text-micro text-mist-500">משיבון</dt>
              <dd className="mt-1 text-small text-mist-400">{row.voicemail}</dd>
            </div>
            <div className="rounded-card bg-night-950/60 p-3">
              <dt className="text-micro text-mist-500">מוקד מענה אנושי</dt>
              <dd className="mt-1 text-small text-mist-400">{row.human}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ol>
  );
}

function DesktopTable() {
  return (
    <div className="mt-12 hidden overflow-hidden rounded-panel border border-night-700 md:block" data-reveal>
      <table className="w-full border-collapse text-start">
        <caption className="sr-only">השוואה בין משיבון, מוקד מענה אנושי ו-CALLBOT</caption>
        <thead>
          <tr className="text-small">
            <th scope="col" className="w-1/4 px-5 py-4 text-start font-medium text-mist-500">
              <span className="sr-only">נושא</span>
            </th>
            <th scope="col" className="w-1/4 px-5 py-4 text-start font-medium text-mist-400">
              משיבון
            </th>
            <th scope="col" className="w-1/4 px-5 py-4 text-start font-medium text-mist-400">
              מוקד מענה אנושי
            </th>
            <th scope="col" className="w-1/4 bg-teal-400/8 px-5 py-4 text-start font-bold text-teal-300">
              CALLBOT
            </th>
          </tr>
        </thead>
        <tbody>
          {comparison.rows.map((row) => (
            <tr key={row.label} className="border-t border-night-700 align-top">
              <th scope="row" className="px-5 py-5 text-start text-small font-semibold text-mist-100">
                {row.label}
              </th>
              <td className="px-5 py-5 text-small text-mist-400">{row.voicemail}</td>
              <td className="px-5 py-5 text-small text-mist-400">{row.human}</td>
              <td className="bg-teal-400/8 px-5 py-5 text-small font-medium text-mist-100">
                <span className="flex items-start gap-2">
                  <span className="mt-0.5 text-teal-300">
                    <CheckIcon />
                  </span>
                  <span>
                    <KeepPrefixed text={row.callbot} />
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Comparison() {
  return (
    <section className="border-t border-night-800 py-24 md:py-32" aria-labelledby="compare-title">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="max-w-3xl" data-reveal>
          <p className="text-small font-medium text-teal-300">לפני שמחליטים</p>
          <h2 id="compare-title" className="mt-4 text-h2 font-bold text-balance">
            {comparison.heading}
          </h2>
          <p className="mt-5 text-lead text-mist-300">{comparison.intro}</p>
        </div>

        <StackedCards />
        <DesktopTable />
      </div>
    </section>
  );
}
