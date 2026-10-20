import { z } from "zod";
import { COMPANY_SIZES, INDUSTRIES, type IndustryId } from "./options";

export { COMPANY_SIZES, INDUSTRIES, type IndustryId };

const INDUSTRY_IDS = INDUSTRIES.map((industry) => industry.id) as [IndustryId, ...IndustryId[]];

/** Consumer mailbox domains blocked per the client brief (business email only). */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.il",
  "ymail.com",
  "hotmail.com",
  "hotmail.co.il",
  "outlook.com",
  "outlook.co.il",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "walla.co.il",
  "walla.com",
  "protonmail.com",
  "proton.me",
  "gmx.com",
  "mail.com",
  "yandex.com",
  "mail.ru",
]);

export function isFreeEmail(email: string): boolean {
  const domain = email.split("@").pop()?.toLowerCase().trim() ?? "";
  return FREE_EMAIL_DOMAINS.has(domain);
}

/** Normalizes +972 / spaces / dashes to a local Israeli number, or returns null if it is not valid. */
export function normalizeIsraeliPhone(raw: string): string | null {
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+972")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("972")) digits = `0${digits.slice(3)}`;
  digits = digits.replace(/\D/g, "");
  if (/^05\d{8}$/.test(digits) || /^07\d{8}$/.test(digits) || /^0[23489]\d{7}$/.test(digits)) return digits;
  return null;
}

const name = (label: string) =>
  z
    .string({ error: label })
    .trim()
    .min(2, label)
    .max(60, "השם ארוך מדי. אפשר לקצר?")
    .regex(/^[\p{L}\p{M}' .\-״׳"]+$/u, "השם יכול לכלול רק אותיות");

export const stepOneSchema = z.object({
  firstName: name("איך קוראים לך?"),
  lastName: name("מה שם המשפחה?"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(120, "כתובת המייל ארוכה מדי")
    .pipe(z.email("כתובת המייל לא שלמה. בדקו את מה שאחרי ה-@"))
    .refine((email) => !isFreeEmail(email), "מייל עסקי בלבד, למשל name@company.co.il"),
  phone: z
    .string()
    .max(20, "המספר ארוך מדי")
    .transform((value, ctx) => {
      const normalized = normalizeIsraeliPhone(value);
      if (!normalized) {
        ctx.addIssue({ code: "custom", message: "מספר ישראלי מלא, למשל 050-1234567" });
        return z.NEVER;
      }
      return normalized;
    }),
});

export const stepTwoSchema = z.object({
  company: z.string().trim().min(2, "מה שם העסק?").max(80, "השם ארוך מדי. אפשר לקצר?"),
  companySize: z.enum(COMPANY_SIZES, { error: "כמה עובדים יש בעסק?" }),
  industry: z.enum(INDUSTRY_IDS, { error: "באיזה תחום העסק?" }),
});

export const leadSchema = stepOneSchema.extend(stepTwoSchema.shape);

export type StepOne = z.infer<typeof stepOneSchema>;
export type Lead = z.infer<typeof leadSchema>;

export type FieldErrors = Partial<Record<keyof Lead, string>>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const errors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof Lead | undefined;
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}
