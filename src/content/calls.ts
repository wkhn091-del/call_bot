export type Speaker = "bot" | "caller";

export type CallLine = {
  speaker: Speaker;
  text: string;
  /** Index into `lead` revealed once this line has been spoken. */
  fills?: readonly number[];
};

export type LeadField = { label: string; value: string; ltr?: boolean };

export type DemoCall = {
  id: "garage" | "clinic" | "realestate";
  tab: string;
  business: string;
  when: string;
  time: string;
  lines: readonly CallLine[];
  lead: readonly LeadField[];
  destination: string;
};

/** Scripted demo calls. Business and caller names are fictional and labelled as such on screen. */
export const demoCalls: readonly DemoCall[] = [
  {
    id: "garage",
    tab: "מוסך",
    business: "מוסך א.ב. רכב",
    when: "יום חמישי",
    time: "21:40",
    destination: "Monday",
    lead: [
      { label: "שם", value: "יוסי כהן" },
      { label: "טלפון", value: "052-•••-4471", ltr: true },
      { label: "רכב", value: "מאזדה 3, 2019" },
      { label: "בקשה", value: "חריקה בבלימה, בדיקת בלמים" },
      { label: "נקבע", value: "יום ראשון, 08:30" },
    ],
    lines: [
      { speaker: "bot", text: "ערב טוב, הגעתם למוסך א.ב. רכב. אני העוזר הקולי של המוסך, במה אפשר לעזור?", fills: [1] },
      { speaker: "caller", text: "היי, תקשיב, יש לי חריקה כזאת מהגלגל כל פעם שאני בולם. זה מתחיל להלחיץ אותי." },
      { speaker: "bot", text: "כדאי שיבדקו את זה. איזה רכב יש לך?", fills: [3] },
      { speaker: "caller", text: "מאזדה 3, מודל 2019.", fills: [2] },
      { speaker: "bot", text: "יש מקום ביום ראשון ב-08:30, או בשני ב-10:00. מה נוח לך?" },
      { speaker: "caller", text: "ראשון בשמונה וחצי, סבבה.", fills: [4] },
      { speaker: "bot", text: "מעולה. על איזה שם לרשום?" },
      { speaker: "caller", text: "יוסי כהן.", fills: [0] },
      { speaker: "bot", text: "רשמתי, יוסי. יום ראשון ב-08:30, בדיקת בלמים למאזדה. לילה טוב!" },
    ],
  },
  {
    id: "clinic",
    tab: "מרפאה",
    business: "מרפאת השיניים של ד״ר לוי",
    when: "יום שישי",
    time: "22:15",
    destination: "Powerlink",
    lead: [
      { label: "שם", value: "מירב אזולאי" },
      { label: "טלפון", value: "054-•••-9132", ltr: true },
      { label: "סוג פנייה", value: "תור דחוף, כאב בשן" },
      { label: "מטופלת", value: "חדשה במרפאה" },
      { label: "נקבע", value: "יום ראשון, 09:00" },
    ],
    lines: [
      { speaker: "bot", text: "ערב טוב, הגעתם למרפאת השיניים של ד״ר לוי. אני העוזרת הקולית של המרפאה, איך אפשר לעזור?", fills: [1] },
      { speaker: "caller", text: "כואבת לי השן מאתמול בלילה, אני כבר לא יודעת מה לעשות עם עצמי. יש תור קרוב?" },
      { speaker: "bot", text: "מצטערת לשמוע. אני לא יכולה לתת ייעוץ רפואי, אבל אפשר לקבוע תור. ביקרת אצלנו בעבר?", fills: [2] },
      { speaker: "caller", text: "לא, זו פעם ראשונה.", fills: [3] },
      { speaker: "bot", text: "התור הקרוב הוא ביום ראשון ב-09:00. לשריין לך אותו?" },
      { speaker: "caller", text: "כן, בבקשה.", fills: [4] },
      { speaker: "bot", text: "על איזה שם?" },
      { speaker: "caller", text: "מירב אזולאי.", fills: [0] },
      { speaker: "bot", text: "שריינתי, מירב. יום ראשון ב-09:00. אם הכאב מחמיר, פני למוקד חירום. רפואה שלמה." },
    ],
  },
  {
    id: "realestate",
    tab: "נדל״ן",
    business: "משרד התיווך גבעון נכסים",
    when: "מוצאי שבת",
    time: "20:30",
    destination: "Monday",
    lead: [
      { label: "שם", value: "אבי ושירן" },
      { label: "טלפון", value: "050-•••-2208", ltr: true },
      { label: "מתעניינים ב", value: "4 חדרים בגבעתיים" },
      { label: "מצב", value: "אישור משכנתא עקרוני" },
      { label: "חזרה מהסוכן", value: "ראשון, 10:00 עד 12:00" },
    ],
    lines: [
      { speaker: "bot", text: "שבוע טוב, הגעתם לגבעון נכסים. אני העוזר הקולי של המשרד, במה אפשר לעזור?", fills: [1] },
      { speaker: "caller", text: "שבוע טוב. ראינו את המודעה על ה-4 חדרים בגבעתיים, רצינו לשמוע עליה.", fills: [2] },
      { speaker: "bot", text: "אעביר את הפרטים לסוכן שאחראי על הנכס. אתם כבר עם אישור משכנתא, או רק מתחילים לבדוק?" },
      { speaker: "caller", text: "יש לנו אישור עקרוני מהבנק.", fills: [3] },
      { speaker: "bot", text: "מצוין. מתי נוח שהסוכן יחזור אליכם?" },
      { speaker: "caller", text: "מחר בבוקר, בין עשר לשתים עשרה.", fills: [4] },
      { speaker: "bot", text: "ועל איזה שם לרשום?" },
      { speaker: "caller", text: "אבי ושירן.", fills: [0] },
      { speaker: "bot", text: "רשמתי. הסוכן יחזור אליכם מחר בין 10:00 ל-12:00. שבוע טוב!" },
    ],
  },
];
