import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url().max(200).default("http://localhost:3000"),
  NEXT_PUBLIC_GTM_ID: z
    .string()
    .regex(/^GTM-[A-Z0-9]{4,12}$/)
    .optional(),
  NEXT_PUBLIC_CALENDLY_URL: z
    .url()
    .max(300)
    .refine((value) => value.startsWith("https://calendly.com/"), "Must be a calendly.com URL")
    .optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z
    .string()
    .regex(/^[\w-]{10,64}$/)
    .optional(),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || undefined,
  NEXT_PUBLIC_CALENDLY_URL: process.env.NEXT_PUBLIC_CALENDLY_URL || undefined,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || undefined,
});

if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`).join("\n");
  throw new Error(`Invalid public environment variables:\n${details}`);
}

export const publicEnv = parsed.data;
