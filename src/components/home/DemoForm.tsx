"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActionState, useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { track } from "@/lib/analytics/track";
import { submitLead, submitStepOne, type FormState } from "@/lib/leads/actions";
import { COMPANY_SIZES, INDUSTRIES, type IndustryId } from "@/lib/leads/options";
import type { FieldErrors } from "@/lib/leads/schema";
import { INDUSTRY_STORAGE_KEY } from "./CallDemo";
import { TurnstileField } from "./TurnstileField";

const INITIAL: FormState = { status: "idle", errors: {}, message: null };
const STEP_ONE_FIELDS = ["firstName", "lastName", "email", "phone"] as const;
type StepOneValues = Record<(typeof STEP_ONE_FIELDS)[number], string>;
type Meta = { startedAt: string; source: string; page: string };

const inputClass =
  "min-h-12 w-full rounded-control border border-night-600 bg-night-950 px-4 text-body text-mist-100 placeholder:text-mist-500 transition-colors duration-100 focus:border-teal-400 focus:outline-none aria-invalid:border-missed-400";

const chipClass =
  "inline-flex min-h-11 cursor-pointer items-center rounded-control border border-night-600 px-4 text-small text-mist-300 transition-colors duration-100 peer-checked:border-teal-400 peer-checked:bg-teal-400/10 peer-checked:text-mist-100 peer-focus-visible:outline-2 peer-focus-visible:outline-teal-400";

const submitClass =
  "inline-flex min-h-14 items-center justify-center gap-3 rounded-control bg-teal-400 px-6 text-lead font-semibold text-night-950 shadow-cta transition duration-100 hover:bg-teal-300 active:scale-97 disabled:opacity-80 motion-reduce:active:scale-100";

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-control bg-missed-400/10 px-4 py-3 text-small text-missed-400">
      {children}
    </p>
  );
}

type FieldProps = {
  name: keyof FieldErrors;
  label: string;
  error?: string;
  hint?: string;
  children: (props: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
};

function Field({ name, label, error, hint, children }: FieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  return (
    <div className="flex flex-col gap-1.5" data-field={name}>
      <label htmlFor={id} className="text-small font-medium text-mist-300">
        {label}
      </label>
      <div className={error ? "animate-shake motion-reduce:animate-none" : undefined}>
        {children({ id, "aria-invalid": Boolean(error), "aria-describedby": error || hint ? messageId : undefined })}
      </div>
      {error ? (
        <p id={messageId} className="text-small text-missed-400">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-micro text-mist-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function useMeta(): Meta {
  const pathname = usePathname();
  const [meta, setMeta] = useState({ startedAt: "", source: "" });
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = [params.get("utm_source"), params.get("utm_medium"), params.get("utm_campaign")]
      .filter(Boolean)
      .join(" | ")
      .replace(/[^\w\-.:/ |]/g, "")
      .slice(0, 120);
    const timer = window.setTimeout(() => setMeta({ startedAt: String(Date.now()), source }), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return { ...meta, page: pathname };
}

function MetaFields({ meta }: { meta: Meta }) {
  return (
    <>
      <input type="hidden" name="startedAt" value={meta.startedAt} />
      <input type="hidden" name="source" value={meta.source} />
      <input type="hidden" name="page" value={meta.page} />
      <div aria-hidden="true" className="pointer-events-none absolute size-px overflow-hidden opacity-0">
        <label>
          אתר
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
    </>
  );
}

function useFocusFirstError(errors: FieldErrors, formRef: RefObject<HTMLFormElement | null>, step: 1 | 2) {
  useEffect(() => {
    const fields = Object.keys(errors);
    for (const field of fields) track("form_error", { form_step: step, field });
    const first = fields[0];
    if (!first || !formRef.current) return;
    formRef.current.querySelector<HTMLElement>(`[data-field="${first}"] input`)?.focus();
  }, [errors, formRef, step]);
}

function readStoredIndustry(): IndustryId | "" {
  try {
    const stored = window.sessionStorage.getItem(INDUSTRY_STORAGE_KEY);
    return INDUSTRIES.find((item) => item.id === stored)?.id ?? "";
  } catch {
    return "";
  }
}

type StepTwoProps = {
  values: StepOneValues;
  meta: Meta;
  hasCalendly: boolean;
  turnstileSiteKey: string | null;
  onEdit: () => void;
};

/** Mounts only after step one succeeds, so it can read browser storage in its initial state. */
function StepTwoForm({ values, meta, hasCalendly, turnstileSiteKey, onEdit }: StepTwoProps) {
  const [state, action, pending] = useActionState(submitLead, INITIAL);
  const [industry, setIndustry] = useState<IndustryId | "">(readStoredIndustry);
  const formRef = useRef<HTMLFormElement>(null);

  useFocusFirstError(state.errors, formRef, 2);
  useEffect(() => {
    formRef.current?.querySelector<HTMLInputElement>("input[name=company]")?.focus();
  }, []);

  const stepOneError = STEP_ONE_FIELDS.find((key) => state.errors[key]);

  return (
    <form ref={formRef} action={action} className="relative mt-7 flex flex-col gap-6" noValidate>
      <MetaFields meta={meta} />
      {STEP_ONE_FIELDS.map((key) => (
        <input key={key} type="hidden" name={key} value={values[key]} />
      ))}

      <div className="flex items-center justify-between gap-4 rounded-control bg-night-950/70 px-4 py-3 text-small">
        <span className="min-w-0 truncate text-mist-300">
          {values.firstName} {values.lastName} · <bdi dir="ltr">{values.email}</bdi>
        </span>
        <button type="button" onClick={onEdit} className="shrink-0 text-teal-300 underline underline-offset-4">
          שינוי
        </button>
      </div>

      <Field name="company" label="שם העסק" error={state.errors.company}>
        {(props) => <input {...props} name="company" autoComplete="organization" maxLength={80} required className={inputClass} />}
      </Field>

      <fieldset className="flex flex-col gap-2" data-field="companySize">
        <legend className="mb-2 text-small font-medium text-mist-300">כמה עובדים יש בעסק?</legend>
        <div className="flex flex-wrap gap-2">
          {COMPANY_SIZES.map((size) => (
            <label key={size} className="relative">
              <input type="radio" name="companySize" value={size} required className="peer sr-only" />
              <span className={chipClass}>
                <bdi dir="ltr" className="font-latin tabular-nums">
                  {size}
                </bdi>
              </span>
            </label>
          ))}
        </div>
        {state.errors.companySize ? <p className="text-small text-missed-400">{state.errors.companySize}</p> : null}
      </fieldset>

      <fieldset className="flex flex-col gap-2" data-field="industry">
        <legend className="mb-2 text-small font-medium text-mist-300">תחום העסק</legend>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((item) => (
            <label key={item.id} className="relative">
              <input
                type="radio"
                name="industry"
                value={item.id}
                checked={industry === item.id}
                onChange={() => setIndustry(item.id)}
                required
                className="peer sr-only"
              />
              <span className={chipClass}>{item.label}</span>
            </label>
          ))}
        </div>
        {state.errors.industry ? <p className="text-small text-missed-400">{state.errors.industry}</p> : null}
      </fieldset>

      {stepOneError ? (
        <ErrorBox>
          {state.errors[stepOneError]}{" "}
          <button type="button" onClick={onEdit} className="underline underline-offset-4">
            לתיקון
          </button>
        </ErrorBox>
      ) : null}
      {state.message ? <ErrorBox>{state.message}</ErrorBox> : null}
      <TurnstileField siteKey={turnstileSiteKey} action="demo_step2" resetSignal={state} />

      <button type="submit" disabled={pending} className={submitClass}>
        {pending ? (
          <>
            <Spinner /> שולחים…
          </>
        ) : hasCalendly ? (
          "לבחירת מועד לדמו"
        ) : (
          "לתיאום הדמו"
        )}
      </button>
    </form>
  );
}

export function DemoForm({ hasCalendly, turnstileSiteKey }: { hasCalendly: boolean; turnstileSiteKey: string | null }) {
  const meta = useMeta();
  const [stepOneState, stepOneAction, stepOnePending] = useActionState(submitStepOne, INITIAL);
  const [values, setValues] = useState<StepOneValues>({ firstName: "", lastName: "", email: "", phone: "" });
  /** Editing lasts until step one returns a fresh result, so a re-submit never flashes step two early. */
  const [editingFor, setEditingFor] = useState<FormState | null>(null);
  const stepOneRef = useRef<HTMLFormElement>(null);

  const onStepTwo = stepOneState.status === "step-two" && editingFor !== stepOneState;
  const errors = stepOneState.errors;

  useFocusFirstError(errors, stepOneRef, 1);
  useEffect(() => {
    if (stepOneState.status === "step-two") track("form_step_complete", { form_step: 1 });
  }, [stepOneState]);

  return (
    <div className="rounded-panel border border-night-700 bg-night-900 p-5 shadow-panel md:p-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-small font-semibold text-mist-100" aria-live="polite">
          שלב <bdi dir="ltr">{onStepTwo ? 2 : 1}</bdi> מתוך <bdi dir="ltr">2</bdi>
        </p>
        <p className="text-micro text-mist-500">פחות מדקה</p>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-night-700" aria-hidden="true">
        <div
          className={`h-full origin-right rounded-full bg-teal-400 transition-transform duration-500 ease-out ${
            onStepTwo ? "scale-x-100" : "scale-x-50"
          }`}
        />
      </div>

      {onStepTwo ? (
        <StepTwoForm
          values={values}
          meta={meta}
          hasCalendly={hasCalendly}
          turnstileSiteKey={turnstileSiteKey}
          onEdit={() => setEditingFor(stepOneState)}
        />
      ) : (
        <form
          ref={stepOneRef}
          action={(formData) => {
            setValues({
              firstName: String(formData.get("firstName") ?? ""),
              lastName: String(formData.get("lastName") ?? ""),
              email: String(formData.get("email") ?? ""),
              phone: String(formData.get("phone") ?? ""),
            });
            stepOneAction(formData);
          }}
          className="relative mt-7 flex flex-col gap-5"
          noValidate
        >
          <MetaFields meta={meta} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field name="firstName" label="שם פרטי" error={errors.firstName}>
              {(props) => (
                <input {...props} name="firstName" autoComplete="given-name" defaultValue={values.firstName} maxLength={60} required className={inputClass} />
              )}
            </Field>
            <Field name="lastName" label="שם משפחה" error={errors.lastName}>
              {(props) => (
                <input {...props} name="lastName" autoComplete="family-name" defaultValue={values.lastName} maxLength={60} required className={inputClass} />
              )}
            </Field>
          </div>
          <Field name="email" label="אימייל של העסק" error={errors.email} hint="רק לתיאום הדמו. בלי ניוזלטר">
            {(props) => (
              <input
                {...props}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                dir="ltr"
                defaultValue={values.email}
                maxLength={120}
                required
                placeholder="name@company.co.il"
                className={`${inputClass} text-start`}
              />
            )}
          </Field>
          <Field name="phone" label="טלפון" error={errors.phone}>
            {(props) => (
              <input
                {...props}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                defaultValue={values.phone}
                maxLength={20}
                required
                placeholder="050-1234567"
                className={`${inputClass} text-start`}
              />
            )}
          </Field>

          {stepOneState.message ? <ErrorBox>{stepOneState.message}</ErrorBox> : null}
          <TurnstileField siteKey={turnstileSiteKey} action="demo_step1" resetSignal={stepOneState} />

          <button type="submit" disabled={stepOnePending} className={`mt-1 ${submitClass}`}>
            {stepOnePending ? (
              <>
                <Spinner /> שומרים…
              </>
            ) : (
              "להמשך, עוד שלב קצר"
            )}
          </button>
        </form>
      )}

      <p className="mt-5 text-micro text-mist-500">
        הפרטים משמשים רק לתיאום הדמו ולחזרה אליכם.{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-mist-300">
          מדיניות פרטיות
        </Link>
      </p>
    </div>
  );
}
