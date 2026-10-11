# DEPLOY - CALLBOT

## בדיקות לפני כל עלייה
```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e   # Playwright, מעלה שרת על פורט 3200 עם LEAD_DELIVERY_MODE=console
```
אותן בדיקות רצות ב-CI (`.github/workflows/ci.yml`) בכל push ו-PR, ברגע ש-`callbot` הוא ריפו נפרד.

## משתני סביבה ב-Vercel
סודות לעולם לא מקבלים קידומת `NEXT_PUBLIC_`. כל המשתנים עוברים ולידציה ב-`src/lib/env/` והבילד נכשל אם ערך לא תקין.

| משתנה | Production | Preview | Development | הערות |
|---|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://afterhours.ai` | כתובת ה-preview | `http://localhost:3000` | משמש ל-canonical, sitemap ו-JSON-LD |
| `LEAD_DELIVERY_MODE` | `live` (חובה) | `console` | `console` | ב-console הלידים רק נרשמים ללוג |
| `HUBSPOT_PRIVATE_APP_TOKEN` | חובה | - | - | Private App עם scope: `crm.objects.contacts.write` |
| `SLACK_WEBHOOK_URL` | חובה | - | - | Incoming Webhook, חייב להתחיל ב-`https://hooks.slack.com/` |
| `SEGMENT_WRITE_KEY` | רשות | - | - | אירוע `Demo Requested` |
| `ONBOARDING_API_URL` + `ONBOARDING_API_TOKEN` | רשות | - | - | חייבים להגיע יחד. נשלח עם `Authorization: Bearer` |
| `NEXT_PUBLIC_CALENDLY_URL` | מומלץ | רשות | רשות | חייב להתחיל ב-`https://calendly.com/`. בלעדיו עמוד התודה מציג "נחזור אליכם" |
| `NEXT_PUBLIC_GTM_ID` | מומלץ | - | - | `GTM-XXXXXXX`. נטען רק אחרי הסכמה לעוגיות |
| `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` | חובה | מומלץ (DB נפרד) | - | Rate Limit משותף לכל ה-instances. חייבים להגיע יחד. בלעדיהם: מגבלה בזיכרון בלבד |
| `TURNSTILE_SECRET_KEY` + `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | חובה | מומלץ (widget נפרד) | - | Cloudflare → Turnstile → Add widget, מצב Managed. להוסיף את דומיין הפרודקשן ואת `*.vercel.app` ל-Preview. בלעדיהם הבדיקה מדולגת |
| `SENTRY_DSN` | חובה | רשות | - | פרויקט Next.js ב-Sentry. רק בצד השרת, ולכן בלי `NEXT_PUBLIC_` |
| `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` | מומלץ | מומלץ | - | `openssl rand -base64 32`. מונע שבירת טפסים פתוחים בזמן פריסה חדשה |

**מצב נעול.** כל עוד חסר ב-Production אחד מהמשתנים שמסומנים "חובה", או ש-`LEAD_DELIVERY_MODE` אינו `live`, האתר עולה, אבל טופס הדמו מוחלף בכרטיס "תיאום דרך האתר ייפתח בקרוב" והשרת מסרב לכל שליחה. ב-Runtime Logs מופיעה השורה `[env] Lead form locked. Missing: ...` עם שמות המשתנים החסרים. אחרי שמוסיפים אותם צריך לעשות Redeploy. הכרטיס מציג טלפון, מייל או Calendly רק אם מילאתם אותם (`site.contact` ב-`src/content/site.ts`, או `NEXT_PUBLIC_CALENDLY_URL`).

## HubSpot
ליצור ב-Contacts את ה-properties הבאים (Settings → Properties) לפני העלייה, אחרת ה-upsert ייכשל:

| Internal name | סוג | ערכים |
|---|---|---|
| `callbot_company_size` | Single-line text | `1-9`, `10-30`, `31-80`, `81-200`, `200+` |
| `callbot_industry` | Single-line text | `garage`, `clinic`, `realestate`, `interior`, `field`, `other` |
| `callbot_lead_stage` | Single-line text | `partial` (שלב 1 בלבד), `demo_requested` |

ה-upsert לפי email. לא נוגעים ב-`lifecyclestage` (HubSpot לא מאפשר להחזיר אחורה).

### בקשת ביקורת אחרי הניסיון (Workflow, לא קוד)
ההוכחה החברתית נאספת ב-Google Business Profile, כי זה מקור עצמאי שאפשר לקשר אליו מהאתר.
1. ב-Google Business Profile: Get more reviews → להעתיק את קישור הביקורת.
2. ב-HubSpot: Automation → Workflows, workflow על Contacts.
3. טריגר: מעבר של `callbot_lead_stage` לסיום הניסיון או ללקוח משלם. את הערכים האלה הצוות מעדכן ידנית או מה-CRM, והאתר לא כותב אותם.
4. פעולה: מייל אחד עם קישור הביקורת, וללא תזכורות חוזרות.
5. אסור: הטבה תמורת ביקורת, או שליחה רק למי שענה "מרוצה" (review gating). שניהם מנוגדים למדיניות Google ולחוק 3.
6. כשיש ביקורות: מציגים באתר דירוג עם קישור למקור, במקום שבו מופיעה היום הפחתת הסיכון.

## Slack
App → Incoming Webhooks → ערוץ לידים (למשל `#demo-requests`). ההודעה כוללת שם, חברה, גודל, תחום ומקור UTM.

## Calendly
אירוע של 15 דקות. ב-Calendly: Embed → לאפשר הטמעה בדומיין. הפרטים (שם ומייל) ממולאים מראש מעוגייה קצרה (30 דקות, HttpOnly).

## GTM ואנליטיקס
- GA4, Meta Pixel, LinkedIn Insight ו-Clarity מוגדרים בתוך GTM, לא בקוד.
- הדומיינים שלהם כבר מאושרים ב-CSP (`src/lib/security/csp.ts`). כלי חדש = להוסיף את הדומיין שלו שם.
- אירוע המרה: צפייה ב-`/thank-you`. ב-GA4 לסמן אותו כ-Key event.
- אירועי KPI נשלחים ל-`dataLayer` רק אחרי הסכמה (`src/lib/analytics/track.ts`). לכל אחד יוצרים ב-GTM טריגר Custom Event ותגית GA4 Event עם אותו שם, ומעבירים את הפרמטרים כ-Data Layer Variables:

| אירוע | פרמטרים | KPI |
|---|---|---|
| `cta_click` | `cta`, `location` | הקלקות CTA לפי מקור |
| `form_reached` | - | הגעה עד הטופס |
| `form_field_start` | `form_step`, `field` | נטישת טופס לפי שדה |
| `form_error` | `form_step`, `field` | נטישת טופס לפי שדה |
| `form_step_complete` | `form_step` | נטישה בין שלב 1 לשלב 2 |
| `demo_call_select` | `call` | השמעת שיחת הדוגמה (תומך) |
| `demo_call_complete` | `call` | השמעת שיחת הדוגמה (תומך) |
| `calculator_use` | `control` | שימוש במחשבון (תומך) |

הפרמטרים הם מזהים ושמות שדות בלבד, אף פעם לא ערך שהוקלד. בדיקה ב-`e2e/site.spec.ts`, קבוצת "מדידה".

## DNS
Cloudflare: רשומת `A`/`CNAME` לפי Vercel. Proxy כבוי (ענן אפור) כדי ש-Vercel ינפיק תעודה.

## אבטחה
כל השכבות, מה כל אחת מכסה, רוטציית מפתחות ורשימת החוסמים להשקה: `docs/security.md`.
בדיקת תקינות ל-uptime monitor: `GET /api/health` (מחזיר `ok`).

**חוסם השקה:** 2FA על כל החשבונות (GitHub, Vercel, Cloudflare, HubSpot, Slack, Google, Upstash, Sentry, Calendly, רשם הדומיין).
