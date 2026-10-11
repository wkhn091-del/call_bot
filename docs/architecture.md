# ארכיטקטורה - CALLBOT (מודול א', שלב 2)

## סוג האתר
דף נחיתה B2B עם המרה אחת: הרשמה לדמו של 15 דקות. אין מכירה אונליין, ולכן אין סכמות מוצר, עגלה, Zustand או מנוע מבצעים (חוק 9, מתועד ב-PROJECT_BRIEF.md).

## טכנולוגיות
| שכבה | בחירה | הערה |
|---|---|---|
| Framework | Next.js 16 (App Router) | `src/proxy.ts` במקום middleware |
| עיצוב | Tailwind CSS 4, טוקנים ב-`@theme` (`src/app/globals.css`) | בלי ערכים שרירותיים |
| תוכן | קבצי TypeScript ב-`src/content/` | Sanity נדחה. המבנה מקביל לסכמות עתידיות |
| ולידציה | Zod 4 | בכל קלט ובמשתני סביבה |
| תנועה | CSS + Motion; GSAP רק ב-Roadmap | חריגה מאושרת (קבוצה 1) |
| טפסים | Server Actions + `useActionState` | עובד גם בלי JS (progressive enhancement) |
| בדיקות | Vitest (לוגיקה), Playwright (מסך), GitHub Actions (CI) | |
| אחסון | Vercel | DNS ב-Cloudflare |

## מבנה
```
src/
  app/            עמודים: /, /pricing, /thank-you, /privacy, /accessibility, robots, sitemap
  components/     home/ (מקטעים), layout/, ui/, motion/, seo/, brand/
  content/        כל הטקסטים (site, home, calls, pricing)
  lib/
    calc/         מחשבון שעות והפסד - פונקציות טהורות + בדיקות
    leads/        סכמות, Server Actions, שליחה ל-HubSpot/Slack/Segment
    env/          משתני סביבה מאומתים (public / server-only)
    security/     CSP, nonce, rate limit
  proxy.ts        CSP עם nonce לכל בקשה
```

## ביצועים
- ה-Hero הוא LCP: תמונה אחת ב-`next/image` עם `priority`, AVIF/WebP. H1 ו-CTA בלי אנימציית כניסה.
- GSAP נטען רק בקומפוננטת ה-Roadmap. Motion רק בקומפוננטות לקוח שצריכות אותו.
- כל העמודים דינמיים בגלל ה-nonce של ה-CSP (עלות זניחה בדף נחיתה; מחליפים ב-SRI אם נדרש static).
- אין שאילתות סינון ואין DB - אין צוואר בקבוק בצד השרת.

## מפת אבטחה

### מה ציבורי ומה פרטי
| מידע | איפה | ציבורי? |
|---|---|---|
| טקסטים, תסריטי הדגמה, FAQ | `src/content` | כן |
| קלט המחשבון | זיכרון הדפדפן בלבד | לא נשלח, לא נשמר |
| תחום שנבחר בהדגמה | `sessionStorage` (`cb_industry`) | רק מזהה תחום, לא PII |
| הסכמה לעוגיות | `localStorage` | כן/לא בלבד |
| פרטי ליד (שם, מייל, טלפון, חברה) | Server Action → HubSpot / Slack / Segment | פרטי. לא נשמר בדפדפן |
| שם פרטי + מייל לעמוד התודה | עוגייה `cb_demo`: HttpOnly, Secure, SameSite=Lax, path=/thank-you, 30 דקות | פרטי, לא נגיש ל-JS |

### איפה כל סוד
| סוד | קובץ | הגנה |
|---|---|---|
| `HUBSPOT_PRIVATE_APP_TOKEN`, `SLACK_WEBHOOK_URL`, `SEGMENT_WRITE_KEY`, `ONBOARDING_API_TOKEN` | `src/lib/env/server.ts` | `import 'server-only'`, Zod, בלי `NEXT_PUBLIC` |
| `NEXT_PUBLIC_*` (כתובת אתר, GTM, Calendly) | `src/lib/env/public.ts` | לא סודות. Zod עם allowlist לדומיין |

### נתיבים והרשאות
אין נתיבים פרטיים ואין משתמשים מחוברים. שתי נקודות כתיבה בלבד, שתיהן Server Actions:
| נקודה | הגנות |
|---|---|
| `submitStepOne` | Zod עם הגבלת אורך · honeypot · זמן מילוי מינימלי 2.5 שניות · rate limit 8 ל-10 דקות לכל IP · שגיאה גנרית |
| `submitLead` | כל הנ"ל · rate limit 5 ל-10 דקות · ולידציה מחדש של כל השדות (לא סומכים על שלב 1) · redirect רק לנתיב קבוע |
| `/thank-you` | `noindex`. העוגייה נקראת עם Zod; ערך לא תקין = עמוד גנרי |

### כותרות
CSP עם nonce ו-`strict-dynamic`, `frame-ancestors 'none'`, HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP. דומיינים חיצוניים רק לפי רשימה (GTM, GA, Meta, LinkedIn, Clarity, Segment, Calendly).

### סיכונים ידועים
- Rate limit בזיכרון של כל instance ב-Vercel. מספיק לדף נחיתה; בעומס - Upstash או Vercel Firewall.
- Cloudflare Turnstile במצב interaction-only, Rate Limit ב-Upstash ו-Sentry. הפירוט המלא: `docs/security.md`.
