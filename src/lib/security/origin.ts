/**
 * Next.js rejects a Server Action whose Origin differs from the host, but lets a request with no
 * Origin header through. Browsers always send Origin on POST, so a missing one means a script.
 * Compares exact hosts (hostname + port), never `includes`, so `callbot.co.il.evil.com` fails.
 */
export function isSameOrigin(origin: string | null, host: string | null): boolean {
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host.trim().toLowerCase();
  } catch {
    return false;
  }
}
