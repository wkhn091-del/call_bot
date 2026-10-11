export const COMPANY_SIZES = ["1-9", "10-30", "31-80", "81-200", "200+"] as const;

export const INDUSTRIES = [
  { id: "garage", label: "מוסך" },
  { id: "clinic", label: "מרפאה או קליניקה" },
  { id: "realestate", label: "נדל״ן" },
  { id: "interior", label: "עיצוב פנים" },
  { id: "field", label: "שירות שטח" },
  { id: "other", label: "אחר" },
] as const;

export type IndustryId = (typeof INDUSTRIES)[number]["id"];
