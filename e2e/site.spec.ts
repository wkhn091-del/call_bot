import { expect, test, type Page } from "@playwright/test";

/** The server treats submissions faster than 2.5s after the form mounts as bots. */
const HUMAN_FILL_MS = 2600;

async function openForm(page: Page) {
  await page.goto("/");
  await page.locator("#book").scrollIntoViewIfNeeded();
  await page.waitForTimeout(HUMAN_FILL_MS);
}

async function fillStepOne(page: Page, email = "dana@garage-ab.co.il") {
  const form = page.locator("#book");
  await form.getByLabel("שם פרטי", { exact: true }).fill("דנה");
  await form.getByLabel("שם משפחה", { exact: true }).fill("כהן");
  await form.getByLabel("אימייל של העסק", { exact: true }).fill(email);
  await form.getByLabel("טלפון", { exact: true }).fill("+972 52-123-4567");
}

test.describe("מחשבון שעות", () => {
  test("ערכי ברירת מחדל: 55 שעות פתוחות, 113 בלי מענה, ₪10,400", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#hours");
    await expect(section.getByRole("heading", { level: 2 })).toContainText(/55.*113/);
    await expect(section).toContainText("₪10,400");
    await expect(section).toContainText(/בערך\s*13\s*לקוחות/);
  });

  test("שישי סגור: 50 פתוחות, 118 בלי מענה", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("יום שישי").selectOption("closed");
    await expect(page.locator("#hours").getByRole("heading", { level: 2 })).toContainText(/50.*118/);
  });

  test("מתג עם CALLBOT מכסה 100% מהשבוע", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("switch", { name: "עם CALLBOT" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(page.locator("#hours")).toContainText("מהשבוע מכוסה");
    await expect(page.locator("#hours dl")).toContainText("100%");
  });
});

test.describe("טופס דמו", () => {
  test("שליחה ריקה מציגה מה חסר ומעבירה פוקוס לשדה הראשון", async ({ page }) => {
    await openForm(page);
    await page.getByRole("button", { name: "להמשך, עוד שלב קצר" }).click();
    await expect(page.getByText("נשמח לדעת איך קוראים לך")).toBeVisible();
    await expect(page.getByText("נשמח לדעת מה שם המשפחה")).toBeVisible();
    await expect(page.locator("#book").getByLabel("שם פרטי", { exact: true })).toBeFocused();
  });

  test("מייל חינמי נחסם עם הסבר", async ({ page }) => {
    await openForm(page);
    await fillStepOne(page, "dana@gmail.com");
    await page.getByRole("button", { name: "להמשך, עוד שלב קצר" }).click();
    await expect(page.getByText("נשמח לכתובת המייל של העסק")).toBeVisible();
    await expect(page.getByText("שלב 1 מתוך 2")).toBeVisible();
  });

  test("תחום מההדגמה ממולא בשלב 2, ושליחה מלאה מגיעה לעמוד התודה", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "מרפאה" }).click();
    await page.locator("#book").scrollIntoViewIfNeeded();
    await page.waitForTimeout(HUMAN_FILL_MS);

    await fillStepOne(page);
    await page.getByRole("button", { name: "להמשך, עוד שלב קצר" }).click();
    await expect(page.getByText("שלב 2 מתוך 2")).toBeVisible();
    await expect(page.getByRole("radio", { name: "מרפאה או קליניקה" })).toBeChecked();

    await page.locator("#book").getByLabel("שם העסק", { exact: true }).fill("מרפאת השיניים של ד״ר לוי");
    await page.getByText("10-30", { exact: true }).click();
    await page.getByRole("button", { name: /לתיאום הדמו|לבחירת מועד לדמו/ }).click();

    await expect(page).toHaveURL(/\/thank-you$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("קיבלנו, דנה.");
    await expect(page.getByRole("heading", { name: "מה כדאי להכין לדמו" })).toBeVisible();

    await page.getByRole("link", { name: "לשיחה ממרפאה" }).click();
    await expect(page).toHaveURL(/\/\?call=clinic#demo$/);
    await expect(page.getByRole("tab", { name: "מרפאה" })).toHaveAttribute("aria-selected", "true");
  });

  test("ערך לא מוכר ב-?call נופל לשיחת ברירת המחדל", async ({ page }) => {
    await page.goto("/?call=<script>#demo");
    await expect(page.getByRole("tab", { name: "מוסך" })).toHaveAttribute("aria-selected", "true");
  });

  test("Hero מציג את ההתחייבויות מתחת לכפתור, במסך הראשון במובייל", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    const note = page.getByText("7 ימי ניסיון").first();
    await expect(note).toBeInViewport();
    await expect(page.getByText("חוזרים עד יום עסקים")).toBeInViewport();
  });
});

test.describe("תנועה ונגישות", () => {
  test("reduced-motion: Roadmap סטטי וכרטיס ה-Hero במצב הסופי", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("#hero-title")).toBeVisible();
    await expect(page.getByText("נשלח ל-")).toBeVisible();
    const how = page.locator("#how");
    await expect(how.getByRole("heading", { level: 3 })).toHaveCount(4);
  });

  test("CTA דביק במובייל מופיע רק אחרי שה-CTA של ה-Hero יצא מהמסך", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const sticky = page.locator("div[aria-hidden]:has(> a[href='#book'])");
    await expect(sticky).toHaveAttribute("aria-hidden", "true");
    await page.locator("#hours").scrollIntoViewIfNeeded();
    await expect(sticky).toHaveAttribute("aria-hidden", "false");
  });

  test("אין שגיאות CSP או JS לאורך כל העמוד", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (event) => {
        console.error(`CSP ${event.violatedDirective} blocked ${event.blockedURI}`);
      });
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    for (let step = 0; step < 30; step += 1) {
      await page.mouse.wheel(0, 600);
      await page.waitForTimeout(100);
    }
    await page.locator("#book").scrollIntoViewIfNeeded();
    expect(errors).toEqual([]);
  });
});

test.describe("מדידה", () => {
  const ourEvents = (page: Page) =>
    page.evaluate(() =>
      ((window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer ?? []).filter(
        (entry) => typeof entry.event === "string" && !String(entry.event).startsWith("gtm."),
      ),
    );

  test("בלי הסכמה לעוגיות לא נשלח שום אירוע", async ({ page }) => {
    await openForm(page);
    await fillStepOne(page);
    await page.locator("#hours select").first().selectOption("9");
    expect(await ourEvents(page)).toEqual([]);
  });

  test("עם הסכמה נשלחים אירועי KPI, בלי אף ערך שהוקלד", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("cb_consent_v1", "granted"));
    await page.goto("/");
    await page.locator("#hours select").first().selectOption("9");
    await page.locator("#book").scrollIntoViewIfNeeded();
    await page.waitForTimeout(HUMAN_FILL_MS);
    await fillStepOne(page);
    await page.getByRole("button", { name: "להמשך, עוד שלב קצר" }).click();
    await expect(page.locator("#book input[name=company]")).toBeVisible();

    const events = await ourEvents(page);
    const names = events.map((entry) => entry.event);
    expect(names).toEqual(
      expect.arrayContaining(["calculator_use", "form_reached", "form_field_start", "form_step_complete"]),
    );
    expect(events.filter((entry) => entry.event === "form_field_start").map((entry) => entry.field)).toEqual(
      expect.arrayContaining(["firstName", "lastName", "email", "phone"]),
    );
    const serialized = JSON.stringify(events);
    for (const typed of ["דנה", "כהן", "dana@garage-ab.co.il", "52-123-4567"]) expect(serialized).not.toContain(typed);
  });
});

test.describe("אבטחה", () => {
  test("כותרות אבטחה ו-CSP עם nonce בכל עמוד", async ({ request }) => {
    const response = await request.get("/");
    const headers = response.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["cross-origin-resource-policy"]).toBe("same-origin");
    expect(headers["strict-transport-security"]).toContain("max-age=63072000");
    expect(headers["x-powered-by"]).toBeUndefined();
    const csp = headers["content-security-policy"];
    expect(csp).toMatch(/script-src [^;]*'nonce-[A-Za-z0-9+/=]+'/);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toMatch(/script-src [^;]*'unsafe-inline'/);
  });

  test("עמוד התודה ובדיקת התקינות לא נשמרים במטמון משותף", async ({ request }) => {
    const thankYou = await request.get("/thank-you", { maxRedirects: 0 });
    expect(thankYou.headers()["cache-control"]).toContain("no-store");
    const health = await request.get("/api/health");
    expect(health.status()).toBe(200);
    expect(await health.text()).toBe("ok");
    expect(health.headers()["cache-control"]).toContain("no-store");
  });

  test("Server Action בלי Origin (סקריפט, לא דפדפן) נדחה", async ({ page }) => {
    await openForm(page);
    await fillStepOne(page);
    const captured = page.waitForRequest((request) => request.method() === "POST" && Boolean(request.headers()["next-action"]));
    await page.getByRole("button", { name: "להמשך, עוד שלב קצר" }).click();
    const original = await captured;

    const headers = { ...original.headers() };
    delete headers.origin;
    delete headers.referer;
    const replay = await page.request.post(original.url(), {
      headers,
      data: original.postDataBuffer() ?? undefined,
    });
    expect(await replay.text()).toContain("משהו השתבש אצלנו בשליחה");
  });
});
