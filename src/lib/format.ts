import { DEMO_TIME_ZONE } from "@/data/demo-clock";

const MINUS = "−";

const integerFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const oneDecimalFormat = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const upToOneDecimalFormat = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 });

const clockFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: DEMO_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});
const dayDateFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: DEMO_TIME_ZONE,
  weekday: "long",
  day: "numeric",
  month: "long",
});
const shortDayDateFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: DEMO_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const shortDateFormat = new Intl.DateTimeFormat("id-ID", { timeZone: DEMO_TIME_ZONE, day: "numeric", month: "short" });
const fullDateFormat = new Intl.DateTimeFormat("id-ID", {
  timeZone: DEMO_TIME_ZONE,
  day: "numeric",
  month: "long",
  year: "numeric",
});

const toDate = (value: string | Date) => (typeof value === "string" ? new Date(value) : value);

export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  return `${rounded < 0 ? MINUS : ""}Rp${integerFormat.format(Math.abs(rounded))}`;
}

export function formatSignedRupiah(amount: number): string {
  return amount > 0 ? `+${formatRupiah(amount)}` : formatRupiah(amount);
}

export function formatRupiahCompact(amount: number): string {
  const sign = amount < 0 ? MINUS : "";
  const absolute = Math.abs(amount);
  if (absolute >= 1_000_000_000) {
    return `${sign}Rp${upToOneDecimalFormat.format(absolute / 1_000_000_000)} M`;
  }
  if (absolute >= 1_000_000) {
    return `${sign}Rp${upToOneDecimalFormat.format(absolute / 1_000_000)} jt`;
  }
  if (absolute >= 10_000) {
    return `${sign}Rp${integerFormat.format(absolute / 1000)} rb`;
  }
  return formatRupiah(amount);
}

export function formatPriceRange(low: number, high: number): string {
  return `${formatRupiah(low)}–${integerFormat.format(high)}`;
}

export function formatKg(kg: number): string {
  return `${upToOneDecimalFormat.format(kg)} kg`;
}

export function formatScore(score: number): string {
  return oneDecimalFormat.format(score);
}

export function formatNumber(value: number): string {
  return integerFormat.format(value);
}

export function formatPercent(rate: number): string {
  return `${integerFormat.format(rate * 100)}%`;
}

export function formatClock(value: string | Date): string {
  return clockFormat.format(toDate(value));
}

export function formatDayDate(value: string | Date): string {
  return dayDateFormat.format(toDate(value));
}

export function formatShortDayDate(value: string | Date): string {
  return shortDayDateFormat.format(toDate(value));
}

export function formatShortDate(value: string | Date): string {
  return shortDateFormat.format(toDate(value));
}

export function formatFullDate(value: string | Date): string {
  return fullDateFormat.format(toDate(value));
}

export function formatDuration(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) {
    return `${rest} menit`;
  }
  return `${hours} j ${String(rest).padStart(2, "0")} m`;
}
