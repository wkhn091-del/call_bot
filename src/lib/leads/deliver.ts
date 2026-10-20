import "server-only";
import { serverEnv } from "@/lib/env/server";
import { reportError } from "@/lib/observability/report";
import { INDUSTRIES, type Lead, type StepOne } from "./schema";

const TIMEOUT_MS = 6000;

type Context = { source: string | null; page: string | null; marketingOptIn: boolean };

function industryLabel(id: Lead["industry"]): string {
  return INDUSTRIES.find((industry) => industry.id === id)?.label ?? id;
}

async function post(url: string, init: RequestInit, label: string): Promise<void> {
  const response = await fetch(url, { ...init, method: "POST", signal: AbortSignal.timeout(TIMEOUT_MS), cache: "no-store" });
  // The response body is not logged: CRM error payloads can echo back the lead's email and phone.
  if (!response.ok) throw new Error(`${label} responded ${response.status}`);
}

/** Contact properties `callbot_company_size`, `callbot_industry` and `callbot_lead_stage` must exist in HubSpot (see DEPLOY.md). */
async function upsertHubSpot(properties: Record<string, string>): Promise<void> {
  const token = serverEnv.HUBSPOT_PRIVATE_APP_TOKEN;
  if (!token) throw new Error("HubSpot token missing");
  await post(
    "https://api.hubapi.com/crm/v3/objects/contacts/batch/upsert",
    {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: [{ idProperty: "email", id: properties.email, properties }] }),
    },
    "HubSpot",
  );
}

function slackEscape(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function notifySlack(lead: Lead, context: Context): Promise<void> {
  const url = serverEnv.SLACK_WEBHOOK_URL;
  if (!url) throw new Error("Slack webhook missing");
  const lines = [
    `*בקשת דמו חדשה* · ${slackEscape(lead.company)}`,
    `${slackEscape(`${lead.firstName} ${lead.lastName}`)} · ${slackEscape(lead.phone)} · ${slackEscape(lead.email)}`,
    `גודל: ${slackEscape(lead.companySize)} עובדים · תחום: ${slackEscape(industryLabel(lead.industry))}`,
    context.marketingOptIn ? "דיוור שיווקי: כן (הסכמה מפורשת)" : "דיוור שיווקי: לא",
    context.source ? `מקור: ${slackEscape(context.source)}` : null,
  ].filter(Boolean);
  await post(
    url,
    { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: lines.join("\n") }) },
    "Slack",
  );
}

async function trackSegment(lead: Lead, context: Context): Promise<void> {
  const key = serverEnv.SEGMENT_WRITE_KEY;
  if (!key) return;
  const auth = `Basic ${Buffer.from(`${key}:`).toString("base64")}`;
  await post(
    "https://api.segment.io/v1/track",
    {
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: lead.email,
        event: "Demo Requested",
        properties: {
          companySize: lead.companySize,
          industry: lead.industry,
          source: context.source,
          page: context.page,
          marketingOptIn: context.marketingOptIn,
        },
        context: { traits: { email: lead.email, firstName: lead.firstName, lastName: lead.lastName, company: lead.company } },
      }),
    },
    "Segment",
  );
}

async function notifyOnboarding(lead: Lead, context: Context): Promise<void> {
  const url = serverEnv.ONBOARDING_API_URL;
  const token = serverEnv.ONBOARDING_API_TOKEN;
  if (!url || !token) return;
  await post(
    url,
    {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ event: "demo_requested", occurredAt: new Date().toISOString(), lead, context }),
    },
    "Onboarding API",
  );
}

function logFailures(results: PromiseSettledResult<void>[], labels: string[]): void {
  results.forEach((result, index) => {
    if (result.status === "rejected") reportError("lead", result.reason, { channel: labels[index] ?? "unknown" });
  });
}

/** Step one: keep the partial lead even if the visitor never finishes step two. */
export async function deliverPartialLead(lead: StepOne): Promise<void> {
  if (serverEnv.LEAD_DELIVERY_MODE === "console") {
    console.info("[lead:partial]", { email: lead.email });
    return;
  }
  await upsertHubSpot({
    email: lead.email,
    firstname: lead.firstName,
    lastname: lead.lastName,
    phone: lead.phone,
    callbot_lead_stage: "partial",
  }).catch((error: unknown) => reportError("lead", error, { channel: "HubSpot partial" }));
}

/** Returns false only when no channel that a salesperson watches received the lead. */
export async function deliverLead(lead: Lead, context: Context): Promise<boolean> {
  if (serverEnv.LEAD_DELIVERY_MODE === "console") {
    console.info("[lead:complete]", {
      email: lead.email,
      company: lead.company,
      marketingOptIn: context.marketingOptIn,
      source: context.source,
      page: context.page,
    });
    return true;
  }

  const labels = ["HubSpot", "Slack", "Segment", "Onboarding API"];
  const results = await Promise.allSettled([
    upsertHubSpot({
      email: lead.email,
      firstname: lead.firstName,
      lastname: lead.lastName,
      phone: lead.phone,
      company: lead.company,
      callbot_company_size: lead.companySize,
      callbot_industry: lead.industry,
      callbot_lead_stage: "demo_requested",
    }),
    notifySlack(lead, context),
    trackSegment(lead, context),
    notifyOnboarding(lead, context),
  ]);
  logFailures(results, labels);

  return results[0]?.status === "fulfilled" || results[1]?.status === "fulfilled";
}
