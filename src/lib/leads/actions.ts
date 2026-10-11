"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { reportBlocked, reportError } from "@/lib/observability/report";
import { isSameOrigin } from "@/lib/security/origin";
import { hashKey, rateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { deliverLead, deliverPartialLead } from "./deliver";
import { leadSchema, stepOneSchema, toFieldErrors, type FieldErrors } from "./schema";

export type FormState = {
  status: "idle" | "step-two" | "error";
  errors: FieldErrors;
  message: string | null;
};

const MIN_FILL_MS = 2500;
const TEN_MINUTES = 10 * 60_000;
const ONE_HOUR = 60 * 60_000;
const GENERIC_ERROR = "משהו השתבש אצלנו בשליחה. אפשר לנסות שוב בעוד רגע.";
const RATE_ERROR = "נשלחו הרבה בקשות מהחיבור הזה. אפשר לנסות שוב בעוד כמה דקות.";
const BOT_ERROR = "לא הצלחנו לוודא שהשליחה הגיעה מדפדפן. אפשר לרענן את העמוד ולנסות שוב.";

const metaSchema = z.object({
  website: z.string().max(0).optional(),
  startedAt: z.coerce.number().int().positive().optional(),
  source: z
    .string()
    .max(120)
    .regex(/^[\w\-.:/ |]*$/)
    .optional()
    .catch(undefined),
  page: z
    .string()
    .max(80)
    .regex(/^\/[\w\-/]*$/)
    .optional()
    .catch(undefined),
});

const FIELDS = ["firstName", "lastName", "email", "phone", "company", "companySize", "industry"] as const;

function read(formData: FormData, keys: readonly string[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const key of keys) {
    const value = formData.get(key);
    if (typeof value === "string") values[key] = value;
  }
  return values;
}

type RequestInfo = { ip: string; sameOrigin: boolean };

/** Vercel overwrites x-forwarded-for and x-real-ip with the client address, so they cannot be spoofed there. */
async function requestInfo(): Promise<RequestInfo> {
  const headerList = await headers();
  const ip = headerList.get("x-real-ip") || headerList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  return { ip, sameOrigin: isSameOrigin(headerList.get("origin"), host) };
}

function looksAutomated(meta: z.infer<typeof metaSchema>): boolean {
  if (meta.website) return true;
  return meta.startedAt !== undefined && Date.now() - meta.startedAt < MIN_FILL_MS;
}

export async function submitStepOne(_previous: FormState, formData: FormData): Promise<FormState> {
  const request = await requestInfo();
  if (!request.sameOrigin) {
    reportBlocked("origin", "step1");
    return { status: "error", errors: {}, message: GENERIC_ERROR };
  }

  const meta = metaSchema.safeParse(read(formData, ["website", "startedAt", "source", "page"]));
  if (!meta.success || looksAutomated(meta.data)) return { status: "step-two", errors: {}, message: null };

  if (!(await rateLimit(`step1:ip:${request.ip}`, 8, TEN_MINUTES))) {
    reportBlocked("rate_limit", "step1");
    return { status: "error", errors: {}, message: RATE_ERROR };
  }

  const parsed = stepOneSchema.safeParse(read(formData, FIELDS));
  if (!parsed.success) return { status: "error", errors: toFieldErrors(parsed.error), message: null };

  if (!(await verifyTurnstile(formData, "demo_step1", request.ip))) {
    reportBlocked("turnstile", "step1");
    return { status: "error", errors: {}, message: BOT_ERROR };
  }

  await deliverPartialLead(parsed.data);
  return { status: "step-two", errors: {}, message: null };
}

export async function submitLead(_previous: FormState, formData: FormData): Promise<FormState> {
  const request = await requestInfo();
  if (!request.sameOrigin) {
    reportBlocked("origin", "lead");
    return { status: "error", errors: {}, message: GENERIC_ERROR };
  }

  const meta = metaSchema.safeParse(read(formData, ["website", "startedAt", "source", "page"]));
  if (!meta.success) return { status: "error", errors: {}, message: GENERIC_ERROR };
  if (looksAutomated(meta.data)) redirect("/thank-you");

  if (!(await rateLimit(`lead:ip:${request.ip}`, 5, TEN_MINUTES))) {
    reportBlocked("rate_limit", "lead");
    return { status: "error", errors: {}, message: RATE_ERROR };
  }

  const parsed = leadSchema.safeParse(read(formData, FIELDS));
  if (!parsed.success) return { status: "step-two", errors: toFieldErrors(parsed.error), message: null };

  if (!(await verifyTurnstile(formData, "demo_step2", request.ip))) {
    reportBlocked("turnstile", "lead");
    return { status: "step-two", errors: {}, message: BOT_ERROR };
  }

  if (!(await rateLimit(`lead:email:${await hashKey(parsed.data.email)}`, 3, ONE_HOUR))) {
    reportBlocked("rate_limit", "lead_email");
    return { status: "step-two", errors: {}, message: RATE_ERROR };
  }

  let delivered = false;
  try {
    delivered = await deliverLead(parsed.data, { source: meta.data.source ?? null, page: meta.data.page ?? null });
  } catch (error) {
    reportError("lead", error);
  }
  if (!delivered) return { status: "step-two", errors: {}, message: GENERIC_ERROR };

  const cookieStore = await cookies();
  const demoCookie = { firstName: parsed.data.firstName, email: parsed.data.email, industry: parsed.data.industry };
  cookieStore.set("cb_demo", JSON.stringify(demoCookie), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/thank-you",
    maxAge: 60 * 30,
  });
  redirect("/thank-you");
}
