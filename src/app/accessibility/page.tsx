import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "הצהרת נגישות" };

export default function AccessibilityPage() {
  const { coordinatorName, coordinatorEmail, coordinatorPhone, lastReviewed } = site.accessibility;
  const hasCoordinator = Boolean(coordinatorName && (coordinatorEmail || coordinatorPhone));

  return (
    <LegalPage title="הצהרת נגישות" updated={lastReviewed}>
      <p>
        אנחנו ב-<bdi dir="ltr">{site.company}</bdi> רוצים שכל אחד יוכל להשתמש באתר, כולל אנשים עם מוגבלות. האתר נבנה
        בהתאם לתקן הישראלי ת״י 5568, המבוסס על הנחיות WCAG 2.0 ברמה AA.
      </p>

      <h2>מה עשינו באתר</h2>
      <ul>
        <li>ניווט מלא במקלדת, עם סימון פוקוס גלוי וקישור ״לדלג לתוכן״ בראש כל עמוד.</li>
        <li>מבנה כותרות היררכי, תוויות לכל שדה בטופס והודעות שגיאה שמוקראות לקוראי מסך.</li>
        <li>ניגודיות צבעים שנבדקה לטקסט ולכפתורים על הרקע הכהה.</li>
        <li>מי שביקש במערכת ההפעלה להפחית תנועה מקבל את האתר בלי אנימציות גלילה ובלי הצמדת מקטעים.</li>
        <li>לשיחה לדוגמה יש כפתור עצירה, והטקסט שלה מוצג במלואו ונגיש לקוראי מסך.</li>
        <li>האתר מותאם לתצוגה במחשב, בטאבלט ובטלפון, וניתן להגדלה עד 200% בלי אובדן תוכן.</li>
      </ul>

      <h2>אם משהו לא נגיש</h2>
      <p>אם נתקלתם בבעיית נגישות — כתבו אלינו. מטפלים בפניות בהקדם.</p>
      {hasCoordinator ? (
        <p>
          רכז/ת הנגישות: {coordinatorName}
          {coordinatorPhone ? (
            <>
              {" "}
              · טלפון: <bdi dir="ltr">{coordinatorPhone}</bdi>
            </>
          ) : null}
          {coordinatorEmail ? (
            <>
              {" "}
              · מייל: <bdi dir="ltr">{coordinatorEmail}</bdi>
            </>
          ) : null}
        </p>
      ) : (
        <p className="text-missed-400">
          טרם מונה רכז נגישות ב־site.ts. עד אז: פנייה דרך טופס תיאום הדמו בעמוד הראשי, עם ציון ״נגישות״.
        </p>
      )}
    </LegalPage>
  );
}
