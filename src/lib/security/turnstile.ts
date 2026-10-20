import "server-only";
import { z } from "zod";
import { serverEnv } from "@/lib/env/server";
import { reportError } from "@/lib/observability/report";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 5000;

export const TURNSTILE_FIELD = "cf-turnstile-response";

/** Cloudflare documents tokens of up to 2048 characters. */
const tokenSchema = z.string().min(1).max(2048);

const verifySchema = z.object({
  success: z.boolean(),
  action: z.string().optional(),
  "error-codes": z.array(z.string()).optional(),
});

/**
 * Without a secret: skip only outside live production (local, preview, portfolio console).
 * Live production fails closed. When a secret is set and Cloudflare is unreachable, reject.
 */
export async function verifyTurnstile(formData: FormData, expectedAction: string, ip: string): Promise<boolean> {
  const secret = serverEnv.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return !(serverEnv.VERCEL_ENV === "production" && serverEnv.LEAD_DELIVERY_MODE === "live");
  }

  const token = tokenSchema.safeParse(formData.get(TURNSTILE_FIELD));
  if (!token.success) return false;

  const body = new URLSearchParams({ secret, response: token.data, idempotency_key: crypto.randomUUID() });
  if (ip !== "unknown") body.set("remoteip", ip);

  try {
    const response = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
    if (!response.ok) throw new Error(`Turnstile siteverify responded ${response.status}`);
    const result = verifySchema.parse(await response.json());
    return result.success && result.action === expectedAction;
  } catch (error) {
    reportError("turnstile", error);
    return false;
  }
}
