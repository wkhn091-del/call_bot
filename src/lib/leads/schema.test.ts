import { describe, expect, it } from "vitest";
import { isFreeEmail, leadSchema, normalizeIsraeliPhone, stepOneSchema } from "./schema";

describe("normalizeIsraeliPhone", () => {
  it.each([
    ["050-123-4567", "0501234567"],
    ["+972 50 123 4567", "0501234567"],
    ["972501234567", "0501234567"],
    ["03-6123456", "036123456"],
    ["077-1234567", "0771234567"],
  ])("normalizes %s", (raw, expected) => {
    expect(normalizeIsraeliPhone(raw)).toBe(expected);
  });

  it.each(["12345", "050-123", "1-800-123-456", "abc"])("rejects %s", (raw) => {
    expect(normalizeIsraeliPhone(raw)).toBeNull();
  });
});

describe("isFreeEmail", () => {
  it("blocks consumer domains case-insensitively", () => {
    expect(isFreeEmail("dana@Gmail.com")).toBe(true);
    expect(isFreeEmail("dana@walla.co.il")).toBe(true);
  });

  it("allows business domains", () => {
    expect(isFreeEmail("dana@garage-ab.co.il")).toBe(false);
  });
});

describe("lead schemas", () => {
  const stepOne = { firstName: "דנה", lastName: "לוי", email: "Dana@Garage-AB.co.il", phone: "050 123 4567" };

  it("accepts and normalizes a valid first step", () => {
    expect(stepOneSchema.parse(stepOne)).toEqual({
      firstName: "דנה",
      lastName: "לוי",
      email: "dana@garage-ab.co.il",
      phone: "0501234567",
    });
  });

  it("rejects a free email with an actionable message", () => {
    const result = stepOneSchema.safeParse({ ...stepOne, email: "dana@gmail.com" });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain("המייל של העסק");
  });

  it("rejects names containing markup", () => {
    expect(stepOneSchema.safeParse({ ...stepOne, firstName: "<script>" }).success).toBe(false);
  });

  it("requires a known company size and industry", () => {
    expect(leadSchema.safeParse({ ...stepOne, company: "מוסך א.ב.", companySize: "5", industry: "garage" }).success).toBe(
      false,
    );
    expect(
      leadSchema.safeParse({ ...stepOne, company: "מוסך א.ב.", companySize: "10-30", industry: "garage" }).success,
    ).toBe(true);
  });
});
