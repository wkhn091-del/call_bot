import { headers } from "next/headers";

/** Escapes `<` so a value can never close the script tag early. */
function serialize(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export async function JsonLd({ data }: { data: Record<string, unknown> }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      // eslint-disable-next-line react/no-danger -- static, server-built JSON-LD; `<` is escaped by serialize().
      dangerouslySetInnerHTML={{ __html: serialize(data) }}
    />
  );
}
