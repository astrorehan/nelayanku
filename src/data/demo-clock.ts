export const DEMO_TIME_ZONE = "Asia/Jakarta";
export const DEMO_TIME_ZONE_OFFSET = "+07:00";
export const DEMO_DATE = "2026-11-05";
export const DEMO_START = new Date(`${DEMO_DATE}T05:41:00${DEMO_TIME_ZONE_OFFSET}`);

export function demoTime(date: string, time: string): string {
  return `${date}T${time}:00${DEMO_TIME_ZONE_OFFSET}`;
}

const DEMO_OFFSET_MS = 7 * 3_600_000;

export function demoTimestamp(instant: Date | number): string {
  const milliseconds = typeof instant === "number" ? instant : instant.getTime();
  return `${new Date(milliseconds + DEMO_OFFSET_MS).toISOString().slice(0, 19)}${DEMO_TIME_ZONE_OFFSET}`;
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function localDateOf(instant: string | Date): string {
  const date = typeof instant === "string" ? new Date(instant) : instant;
  return new Intl.DateTimeFormat("en-CA", { timeZone: DEMO_TIME_ZONE }).format(date);
}

export function weekdayOf(isoDate: string): number {
  return new Date(`${isoDate}T12:00:00Z`).getUTCDay();
}

export function demoNowFrom(sessionStartedAtMs: number, realNowMs: number): Date {
  return new Date(DEMO_START.getTime() + Math.max(0, realNowMs - sessionStartedAtMs));
}
