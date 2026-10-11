type Directives = Record<string, readonly string[]>;

const ANALYTICS_CONNECT = [
  "https://www.google-analytics.com",
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.googletagmanager.com",
  "https://*.doubleclick.net",
  "https://www.google.com",
  "https://www.facebook.com",
  "https://connect.facebook.net",
  "https://px.ads.linkedin.com",
  "https://*.clarity.ms",
  "https://c.bing.com",
  "https://api.segment.io",
  "https://cdn.segment.com",
] as const;

const ANALYTICS_IMG = [
  "https://www.googletagmanager.com",
  "https://*.google-analytics.com",
  "https://*.doubleclick.net",
  "https://www.google.com",
  "https://www.google.co.il",
  "https://www.facebook.com",
  "https://px.ads.linkedin.com",
  "https://*.clarity.ms",
  "https://c.bing.com",
] as const;

const CALENDLY = "https://calendly.com";
const TURNSTILE = "https://challenges.cloudflare.com";

function serialize(directives: Directives): string {
  return Object.entries(directives)
    .map(([name, values]) => (values.length ? `${name} ${values.join(" ")}` : name))
    .join("; ");
}

export function buildSiteCsp(nonce: string, isDev: boolean): string {
  return serialize({
    "default-src": ["'self'"],
    // 'strict-dynamic' lets the nonced GTM loader pull GA4, Meta, LinkedIn and Clarity after consent.
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https:",
      TURNSTILE,
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    "style-src": ["'self'", `'nonce-${nonce}'`],
    // React style props and Motion write inline style attributes, which a nonce cannot cover.
    "style-src-attr": ["'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", ...ANALYTICS_IMG],
    "font-src": ["'self'"],
    "connect-src": ["'self'", TURNSTILE, ...ANALYTICS_CONNECT, ...(isDev ? ["ws:"] : [])],
    "frame-src": [CALENDLY, TURNSTILE, "https://td.doubleclick.net", "https://www.googletagmanager.com"],
    "worker-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
    ...(isDev ? {} : { "upgrade-insecure-requests": [] }),
  });
}

export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
