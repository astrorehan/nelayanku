export interface FreshnessWindow {
  icedHours: number;
  unicedHours: number;
}

export type FreshClockStatus = "safe" | "soon" | "expired";

export type SppgIneligibilityReason = "no_ice" | "time_exceeded";

const MINUTE = 60_000;
const SOON_THRESHOLD_SHARE = 0.25;

export function freshDeadline(landedAt: Date, window: FreshnessWindow, iced: boolean): Date {
  const hours = iced ? window.icedHours : window.unicedHours;
  return new Date(landedAt.getTime() + hours * 60 * MINUTE);
}

export function minutesSince(start: Date, now: Date): number {
  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / MINUTE));
}

export function remainingFreshMinutes(landedAt: Date, now: Date, window: FreshnessWindow, iced: boolean): number {
  return Math.max(0, Math.floor((freshDeadline(landedAt, window, iced).getTime() - now.getTime()) / MINUTE));
}

export function freshClockStatus(landedAt: Date, now: Date, window: FreshnessWindow, iced: boolean): FreshClockStatus {
  const totalMinutes = (iced ? window.icedHours : window.unicedHours) * 60;
  const remaining = remainingFreshMinutes(landedAt, now, window, iced);
  if (remaining === 0) {
    return "expired";
  }
  return remaining <= totalMinutes * SOON_THRESHOLD_SHARE ? "soon" : "safe";
}

export function sppgIneligibilityReason(params: {
  histamineRisk: boolean;
  iced: boolean;
  landedAt: Date;
  now: Date;
  window: FreshnessWindow;
}): SppgIneligibilityReason | null {
  const { histamineRisk, iced, landedAt, now, window } = params;
  if (!histamineRisk) {
    return null;
  }
  if (!iced) {
    return "no_ice";
  }
  return remainingFreshMinutes(landedAt, now, window, iced) === 0 ? "time_exceeded" : null;
}
