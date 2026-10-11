# אבטחה - CALLBOT (סקריפט 3, מודול א', דרגה A)

עודכן: 12.10.2026. כל שינוי שמחליש שכבה כאן מחייב אישור של אבישי לפני המיזוג.

## משטח התקיפה
דף נחיתה בלי DB, בלי חשבונות משתמש ובלי סליקה. נקודת קלט אחת: טופס הדמו (שני Server Actions, `submitStepOne` ו-`submitLead` ב-`src/lib/leads/actions.ts`). הנתונים יוצאים רק ל-HubSpot, ל-Slack, ל-Segment ול-API הפנימי, כולם בצד השרת.

## שכבות, ומה כל אחת לא מכסה

| שכבה | איפה | מגינה מפני | לא מגינה מפני |
|---|---|---|---|
| CSP עם nonce ו-`strict-dynamic` | `src/proxy.ts`, `src/lib/security/csp.ts` | הרצת סקריפט מוזרק (XSS), הטמעת האתר ב-iframe, `object`/`base` זדוניים | סקריפט שנטען בתוך GTM אחרי הסכמה (GTM מורשה לטעון סקריפטים). מי שמחזיק את חשבון GTM יכול להריץ קוד באתר, ולכן 2FA על GTM חובה |
| כותרות אבטחה | `next.config.ts` | Clickjacking (`X-Frame-Options: DENY` + `frame-ancestors`), MIME sniffing, דליפת Referrer, שימוש במצלמה/מיקרופון, טעינת משאבים שלנו מאתר זר (CORP) | כלום ברמת השרת. אלה הוראות לדפדפן |
| בדיקת Origin מדויקת | `src/lib/security/origin.ts` | CSRF, וגם בקשה בלי Origin בכלל. Next.js חוסם Origin שגוי אבל מעביר בקשה בלי Origin | סקריפט שמזייף Origin נכון. בשביל זה יש Rate Limit ו-Turnstile |
| Honeypot וזמן מילוי | `actions.ts` | בוטים פשוטים שממלאים כל שדה או שולחים מיד | בוט שמריץ דפדפן אמיתי |
| Rate Limit (Upstash, חלון נע) | `src/lib/security/rate-limit.ts` | הצפה: שלב 1 עד 8 ב-10 דקות לכל IP, ליד מלא עד 5 ב-10 דקות לכל IP, ועד 3 בשעה לכל מייל (נשמר כ-hash, לא כטקסט) | בוטנט עם אלפי כתובות IP. בשביל זה יש Turnstile. אם Upstash לא זמין, נופלים למגבלה בזיכרון של כל instance ומדווחים ל-Sentry |
| Cloudflare Turnstile | `src/lib/security/turnstile.ts`, `TurnstileField.tsx` | בוטים מבוססי דפדפן. השרת מאמת את הטוקן מול Cloudflare, ובודק שה-action תואם לשלב (`demo_step1`/`demo_step2`). נכשל בצורה סגורה: אם Cloudflare לא עונה, השליחה נדחית | אדם אמיתי ששולח ספאם ידני. הטוקן חד-פעמי והווידג'ט מתאפס אחרי כל תשובה מהשרת |
| ולידציית Zod | `src/lib/leads/schema.ts`, `actions.ts` | קלט חריג: אורכים, תווים, מיילים חינמיים, טלפון לא ישראלי, ערכי enum לא מוכרים | - |
| מגבלת גוף בקשה | `next.config.ts`, `bodySizeLimit: 64kb` | שליחת גוף ענק ל-Server Action כדי להעמיס על השרת | - |
| ולידציית env | `src/lib/env/server.ts` | ערך בפורמט שגוי: השרת לא עולה בכלל. פרודקשן בלי Turnstile, Upstash, Sentry, HubSpot, Slack או `LEAD_DELIVERY_MODE=live`: מצב נעול (`leadsLocked`). האתר מוצג, הטופס לא מוצג, ושתי ה-Server Actions מחזירות שגיאה לפני שהן קוראות שדה כלשהו. שמות המפתחות החסרים (בלי ערכים) נרשמים ב-Runtime Logs | ערך נכון בפורמט אבל שגוי בתוכן (מפתח של חשבון אחר) |
| Sentry בלי PII | `src/instrumentation.ts`, `src/lib/observability/report.ts` | דליפת פרטי לידים לכלי ניטור: בלי עוגיות, headers, גוף בקשה, query, משתני stack או user. דיווחי חסימה מוגבלים לאחד בדקה לכל סוג, כדי שהצפה לא תשרוף את המכסה | - |
| עוגיית עמוד התודה | `actions.ts` | `HttpOnly`, `Secure`, `SameSite=Lax`, נתיב `/thank-you` בלבד, 30 דקות. העמוד `no-store` כדי שלא יישמר במטמון משותף | - |
| Source maps | `productionBrowserSourceMaps: false` | חשיפת קוד המקור בדפדפן | - |

## לא רלוונטי לאתר הזה (ומה יפעיל אותו מחדש)
- **עגלה, סליקה, Webhooks נכנסים**: אין מכירה אונליין. אם יתווספו, נדרשים אימות חתימה ו-idempotency.
- **IDOR, הרשאות, OTP, Auth**: אין חשבונות משתמש.
- **Sanity / CMS**: התוכן בקוד (`src/content`). אם יתווסף CMS, נדרשים טוקן קריאה בלבד ו-webhook חתום.
- **העלאת קבצים**: אין.
- **SQL / NoSQL injection**: אין DB. Upstash מקבל רק מפתחות שאנחנו בונים (`step1:ip:...`, hash של מייל).

## מפתחות וסודות
- סוד לעולם לא מקבל קידומת `NEXT_PUBLIC_`. המפתחות הציבוריים היחידים: `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `NEXT_PUBLIC_CALENDLY_URL`, `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_SITE_URL`.
- מפתחות נפרדים ל-Preview ול-Production: Upstash DB נפרד, Turnstile widget נפרד, פרויקט Sentry אחד עם environment שונה.
- `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`: מפתח קבוע להצפנת מזהי Server Actions, כך שהם לא משתנים בין פריסות. יוצרים עם `openssl rand -base64 32`. השרת לא עולה אם הוא לא בפורמט תקין.

### החלפת מפתח (רוטציה)
כל מפתח מתחלף: מיד אחרי חשד לדליפה, כשמי שהייתה לו גישה עוזב, ופעם בשנה.
1. יוצרים מפתח חדש בשירות (HubSpot Private App, Slack webhook, Upstash token, Turnstile secret, Sentry DSN).
2. מעדכנים ב-Vercel → Settings → Environment Variables, בסביבה הנכונה.
3. Redeploy.
4. מבטלים את המפתח הישן בשירות, רק אחרי שהפריסה החדשה עובדת.
5. בודקים: שליחת ליד מ-Preview, `GET /api/health`, ואירוע בדיקה ב-Sentry.

## ניטור
- `GET /api/health` מחזיר `ok` בלי שום מידע על גרסאות או תלויות. מתאים ל-uptime monitor (למשל Better Stack או UptimeRobot, כל 5 דקות).
- Sentry: שגיאות שרת דרך `onRequestError`, וכשל מסירה לכל ערוץ (`reportError`, עם תגית `channel`). חסימות (`blocked:rate_limit`, `blocked:turnstile`, `blocked:origin`) נרשמות ב-warning. מומלץ להגדיר התראה על קפיצה ב-`blocked:*`.

## לפני השקה - חובה (חוסם)
- [ ] **2FA על כל החשבונות**: GitHub, Vercel, Cloudflare, HubSpot, Slack, Google (GTM/GA4), Upstash, Sentry, Calendly, רשם הדומיין. כרגע לא מופעל.
- [ ] GitHub: branch protection על `main` (PR חובה, CI ירוק חובה, בלי force push).
- [ ] GitHub: Secret scanning ו-Push protection מופעלים.
- [ ] Vercel: Deployment Protection על Preview.
- [ ] כל משתני הפרודקשן מוגדרים (DEPLOY.md). השרת לא יעלה בלעדיהם.
- [ ] `security.txt`: צריך כתובת מייל לדיווח על חולשות.
- [ ] `npm audit --omit=dev`: 0 חולשות (נכון ל-12.10.2026). 5 חולשות high קיימות רק בכלי פיתוח (eslint-config-next דרך braces) ולא מגיעות לפרודקשן.

## בדיקות אוטומטיות
- `src/lib/security/origin.test.ts`: Origin זהה עובר. Origin חסר, דומה (`afterhours.ai.evil.com`), פורט אחר או לא תקין נדחה.
- `e2e/site.spec.ts`, קבוצת "אבטחה": כותרות ו-CSP עם nonce, `no-store` בעמוד התודה וב-health, ו-Server Action בלי Origin שנדחה.
- "אין שגיאות CSP או JS לאורך כל העמוד": גלילה מלאה בלי הפרת CSP.
