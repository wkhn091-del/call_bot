export const HOURS_PER_WEEK = 168;
export const WEEKS_PER_MONTH = 52 / 12;

export type OpeningHours = {
  /** Sunday to Thursday opening hour, 0-23. */
  weekdayOpen: number;
  /** Sunday to Thursday closing hour, 1-24, must be after `weekdayOpen`. */
  weekdayClose: number;
  /** Friday closing hour, or null when closed on Friday. Friday opens at `weekdayOpen`. */
  fridayClose: number | null;
};

export type LossInputs = {
  missedPerWeek: number;
  closeRatePercent: number;
  dealValue: number;
};

export const LIMITS = {
  missedPerWeek: { min: 0, max: 150, step: 1 },
  closeRatePercent: { min: 0, max: 100, step: 5 },
  dealValue: { min: 0, max: 20000, step: 50 },
} as const;

const clamp = (value: number, min: number, max: number) =>
  Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : min;

/** Day index 0 = Sunday ... 6 = Saturday. Returns whether hour `h` of that day is staffed. */
export function isOpen(hours: OpeningHours, day: number, hour: number): boolean {
  const open = clamp(Math.floor(hours.weekdayOpen), 0, 23);
  const close = clamp(Math.floor(hours.weekdayClose), open + 1, 24);
  if (day >= 0 && day <= 4) return hour >= open && hour < close;
  if (day === 5 && hours.fridayClose !== null) {
    const fridayClose = clamp(Math.floor(hours.fridayClose), open, 24);
    return hour >= open && hour < fridayClose;
  }
  return false;
}

export function weeklyHours(hours: OpeningHours): { open: number; closed: number } {
  let open = 0;
  for (let day = 0; day < 7; day += 1) {
    for (let hour = 0; hour < 24; hour += 1) if (isOpen(hours, day, hour)) open += 1;
  }
  return { open, closed: HOURS_PER_WEEK - open };
}

export function monthlyLoss(inputs: LossInputs): { customers: number; value: number } {
  const missed = clamp(inputs.missedPerWeek, LIMITS.missedPerWeek.min, LIMITS.missedPerWeek.max);
  const rate = clamp(inputs.closeRatePercent, LIMITS.closeRatePercent.min, LIMITS.closeRatePercent.max) / 100;
  const deal = clamp(inputs.dealValue, LIMITS.dealValue.min, LIMITS.dealValue.max);

  const customers = missed * WEEKS_PER_MONTH * rate;
  return {
    customers: Math.round(customers),
    value: Math.round((customers * deal) / 10) * 10,
  };
}
