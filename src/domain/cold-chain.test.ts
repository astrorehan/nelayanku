import { describe, expect, it } from "vitest";
import { freshClockStatus, minutesSince, remainingFreshMinutes, sppgIneligibilityReason } from "./cold-chain";

const window = { icedHours: 8, unicedHours: 3 };
const landedAt = new Date("2026-11-05T05:05:00+07:00");
const at = (time: string) => new Date(`2026-11-05T${time}:00+07:00`);

describe("remainingFreshMinutes", () => {
  it("counts down from the iced window", () => {
    expect(remainingFreshMinutes(landedAt, at("07:02"), window, true)).toBe(363);
  });

  it("uses the shorter window without ice", () => {
    expect(remainingFreshMinutes(landedAt, at("07:02"), window, false)).toBe(63);
  });

  it("never goes below zero", () => {
    expect(remainingFreshMinutes(landedAt, at("23:00"), window, true)).toBe(0);
  });
});

describe("freshClockStatus", () => {
  it("is safe early, soon in the last quarter, expired after the deadline", () => {
    expect(freshClockStatus(landedAt, at("06:00"), window, true)).toBe("safe");
    expect(freshClockStatus(landedAt, at("11:30"), window, true)).toBe("soon");
    expect(freshClockStatus(landedAt, at("13:05"), window, true)).toBe("expired");
  });
});

describe("minutesSince", () => {
  it("measures time since landing", () => {
    expect(minutesSince(landedAt, at("07:15"))).toBe(130);
  });
});

describe("sppgIneligibilityReason", () => {
  const base = { histamineRisk: true, iced: true, landedAt, now: at("07:00"), window };

  it("allows iced histamine-risk fish within the window", () => {
    expect(sppgIneligibilityReason(base)).toBeNull();
  });

  it("blocks histamine-risk fish without ice", () => {
    expect(sppgIneligibilityReason({ ...base, iced: false })).toBe("no_ice");
  });

  it("blocks histamine-risk fish past the window", () => {
    expect(sppgIneligibilityReason({ ...base, now: at("14:00") })).toBe("time_exceeded");
  });

  it("does not apply the histamine rule to other species", () => {
    expect(sppgIneligibilityReason({ ...base, histamineRisk: false, iced: false })).toBeNull();
  });
});
