import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16 md:px-8 md:py-24">
      <h1 className="text-h2 font-bold">{title}</h1>
      <p className="mt-3 text-small text-mist-500">
        עודכן לאחרונה: <bdi dir="ltr">{updated}</bdi>
      </p>
      <div className="legal-body mt-10 flex flex-col gap-6 text-body text-mist-300">
        {children}
      </div>
    </article>
  );
}
