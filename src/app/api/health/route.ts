/** Uptime probe. Reveals nothing about versions, env or dependencies. */
export function GET() {
  return new Response("ok", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store, max-age=0" },
  });
}
