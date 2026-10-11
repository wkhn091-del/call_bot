import { describe, expect, it } from "vitest";
import { isOpen, monthlyLoss, weeklyHours } from "./missed-calls";

describe("weeklyHours", () => {
  it("counts Sunday-Thursday 08:00 to 18:00 plus Friday until 13:00", () => {
    expect(weeklyHours({ weekdayOpen: 8, weekdayClose: 18, fridayClose: 13 })).toEqual({ open: 55, closed: 113 });
  });

  it("treats Friday as closed when fridayClose is null", () => {
    expect(weeklyHours({ weekdayOpen: 8, weekdayClose: 18, fridayClose: null })).toEqual({ open: 50, closed: 118 });
  });

  it("never opens on Saturday", () => {
    expect(isOpen({ weekdayOpen: 0, weekdayClose: 24, fridayClose: 24 }, 6, 12)).toBe(false);
  });

  it("forces closing after opening when the inputs are reversed", () => {
    expect(weeklyHours({ weekdayOpen: 18, weekdayClose: 8, fridayClose: null }).open).toBe(5);
  });

  it("covers a full 24 hour weekday", () => {
    expect(weeklyHours({ weekdayOpen: 0, weekdayClose: 24, fridayClose: null })).toEqual({ open: 120, closed: 48 });
  });
});

describe("monthlyLoss", () => {
  it("multiplies weekly missed calls by weeks per month, close rate and deal value", () => {
    expect(monthlyLoss({ missedPerWeek: 15, closeRatePercent: 20, dealValue: 800 })).toEqual({
      customers: 13,
      value: 10400,
    });
  });

  it("returns zero for zero missed calls", () => {
    expect(monthlyLoss({ missedPerWeek: 0, closeRatePercent: 50, dealValue: 1000 })).toEqual({ customers: 0, value: 0 });
  });

  it("clamps out-of-range and non-numeric input", () => {
    expect(monthlyLoss({ missedPerWeek: -5, closeRatePercent: 300, dealValue: Number.NaN })).toEqual({
      customers: 0,
      value: 0,
    });
    expect(monthlyLoss({ missedPerWeek: 1000, closeRatePercent: 100, dealValue: 100 }).customers).toBe(650);
  });
});
