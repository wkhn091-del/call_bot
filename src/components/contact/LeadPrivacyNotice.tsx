import Link from "next/link";
import { site } from "@/content/site";

/** Legal notice under the demo form submit — transactional use only unless marketing is opted in separately. */
export function LeadPrivacyNotice() {
  return (
    <p className="mt-4 text-micro text-mist-400">
      בלחיצה על שליחה אני מאשר/ת ש־
      <bdi dir="ltr">{site.company}</bdi> תעבד את הפרטים שמסרתי לצורך תיאום דמו וחזרה אליי בנוגע לשירות{" "}
      {site.brand}, בהתאם ל
      <Link href="/privacy" className="text-mist-300 underline underline-offset-4 hover:text-mist-100">
        מדיניות הפרטיות
      </Link>
      . לא יישלח אליי דיוור שיווקי ללא הסכמה נפרדת.
    </p>
  );
}

/** Unchecked by default — required for חוק הספאם / תיקון 40 before any marketing send. */
export function MarketingOptIn() {
  return (
    <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-micro text-mist-400">
      <input
        type="checkbox"
        name="marketingOptIn"
        value="1"
        className="mt-0.5 size-4 shrink-0 rounded border-night-600 bg-night-950 text-teal-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-400"
      />
      <span>מאשר/ת לקבל עדכונים ומידע שיווקי מ־{site.brand} באימייל או SMS. אפשר לבטל בכל עת.</span>
    </label>
  );
}
