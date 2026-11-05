import { describe, expect, it } from "vitest";
import {
  formatClock,
  formatDayDate,
  formatDuration,
  formatKg,
  formatPercent,
  formatPriceRange,
  formatRupiah,
  formatRupiahCompact,
  formatScore,
  formatShortDayDate,
  formatSignedRupiah,
} from "./format";

describe("money", () => {
  it("writes Rupiah the Indonesian way", () => {
    expect(formatRupiah(20000)).toBe("Rp20.000");
    expect(formatRupiah(-1500)).toBe("−Rp1.500");
    expect(formatSignedRupiah(293400)).toBe("+Rp293.400");
  });

  it("abbreviates large amounts", () => {
    expect(formatRupiahCompact(4_100_000)).toBe("Rp4,1 jt");
    expect(formatRupiahCompact(850_000)).toBe("Rp850 rb");
    expect(formatRupiahCompact(9_500)).toBe("Rp9.500");
  });

  it("joins a price range without repeating the currency", () => {
    expect(formatPriceRange(14200, 16400)).toBe("Rp14.200–16.400");
  });
});

describe("quantities", () => {
  it("uses a decimal comma", () => {
    expect(formatKg(18)).toBe("18 kg");
    expect(formatKg(14.5)).toBe("14,5 kg");
    expect(formatScore(8)).toBe("8,0");
    expect(formatScore(8.175)).toBe("8,2");
    expect(formatPercent(0.957)).toBe("96%");
  });
});

describe("time in WIB", () => {
  const morning = "2026-11-05T05:41:00+07:00";

  it("uses a dot between hours and minutes", () => {
    expect(formatClock(morning)).toBe("05.41");
  });

  it("names the day in Indonesian", () => {
    expect(formatDayDate(morning)).toBe("Kamis, 5 November");
    expect(formatShortDayDate(morning)).toBe("Kam, 5 Nov");
  });

  it("formats remaining time compactly", () => {
    expect(formatDuration(363)).toBe("6 j 03 m");
    expect(formatDuration(50)).toBe("50 menit");
  });
});
