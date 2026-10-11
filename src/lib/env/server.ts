import "server-only";
import { z } from "zod";

const optionalSecret = (max: number) => z.string().trim().min(1).max(max).optional();

const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    VERCEL_ENV: z.enum(["development", "preview", "production"]).optional(),

    LEAD_DELIVERY_MODE: z.enum(["live", "console"]).default("console"),

    HUBSPOT_PRIVATE_APP_TOKEN: optionalSecret(512),
    SLACK_WEBHOOK_URL: z
      .url()
      .max(300)
      .refine((value) => value.startsWith("https://hooks.slack.com/"), "Must be a Slack incoming webhook")
      .optional(),
    SEGMENT_WRITE_KEY: optionalSecret(128),
    ONBOARDING_API_URL: z.url().max(300).optional(),
    ONBOARDING_API_TOKEN: optionalSecret(512),

    UPSTASH_REDIS_REST_URL: z
      .url()
      .max(300)
      .refine((value) => value.startsWith("https://"), "Must be the https REST URL from the Upstash console")
      .optional(),
    UPSTASH_REDIS_REST_TOKEN: optionalSecret(512),
    TURNSTILE_SECRET_KEY: optionalSecret(256),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalSecret(128),
    SENTRY_DSN: z
      .url()
      .max(300)
      .refine((value) => value.startsWith("https://"), "Must be an https Sentry DSN")
      .optional(),
    // Read by Next.js itself. Validated here so a malformed key fails the boot, not the first form submit.
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: z
      .string()
      .trim()
      .refine((value) => {
        if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return false;
        return [16, 24, 32].includes(atob(value).length);
      }, "Must be a base64 AES key of 16, 24 or 32 bytes (openssl rand -base64 32)")
      .optional(),
  })
  .superRefine((env, ctx) => {
    if (env.VERCEL_ENV === "production") {
      for (const key of ["UPSTASH_REDIS_REST_URL", "TURNSTILE_SECRET_KEY", "NEXT_PUBLIC_TURNSTILE_SITE_KEY", "SENTRY_DSN"] as const) {
        if (!env[key]) {
          ctx.addIssue({ code: "custom", path: [key], message: `${key} is required in production.` });
        }
      }
    }
    if (Boolean(env.UPSTASH_REDIS_REST_URL) !== Boolean(env.UPSTASH_REDIS_REST_TOKEN)) {
      ctx.addIssue({
        code: "custom",
        path: ["UPSTASH_REDIS_REST_URL"],
        message: "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set together.",
      });
    }
    if (Boolean(env.TURNSTILE_SECRET_KEY) !== Boolean(env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)) {
      ctx.addIssue({
        code: "custom",
        path: ["TURNSTILE_SECRET_KEY"],
        message: "TURNSTILE_SECRET_KEY and NEXT_PUBLIC_TURNSTILE_SITE_KEY must be set together.",
      });
    }
    if (env.VERCEL_ENV === "production" && env.LEAD_DELIVERY_MODE !== "live") {
      ctx.addIssue({
        code: "custom",
        path: ["LEAD_DELIVERY_MODE"],
        message: "Production must deliver leads live; console mode is for local development only.",
      });
    }
    if (env.LEAD_DELIVERY_MODE === "live") {
      for (const key of ["HUBSPOT_PRIVATE_APP_TOKEN", "SLACK_WEBHOOK_URL"] as const) {
        if (!env[key]) {
          ctx.addIssue({ code: "custom", path: [key], message: `${key} is required when LEAD_DELIVERY_MODE=live.` });
        }
      }
    }
    if (Boolean(env.ONBOARDING_API_URL) !== Boolean(env.ONBOARDING_API_TOKEN)) {
      ctx.addIssue({
        code: "custom",
        path: ["ONBOARDING_API_URL"],
        message: "ONBOARDING_API_URL and ONBOARDING_API_TOKEN must be set together.",
      });
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function readEnv(): Record<string, string | undefined> {
  const raw: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(process.env)) raw[key] = value === "" ? undefined : value;
  return raw;
}

function parseServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(readEnv());
  if (!result.success) {
    const details = result.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
    throw new Error(`Invalid server environment variables:\n${details}`);
  }
  return result.data;
}

export const serverEnv: ServerEnv = parseServerEnv();
