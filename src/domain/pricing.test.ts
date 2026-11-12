import { describe, expect, it } from "vitest";
import {
  breakEvenBuyerPrice,
  fairFisherPriceRange,
  fisherPricePerKg,
  gainOverPortPrice,
  priceBreakdown,
  roundUpTo,
  suggestedBuyerPriceRange,
} from "./pricing";

describe("priceBreakdown", () => {
  it("reproduces the PRD §11 example for a restaurant paying Rp24.000", () => {
    const breakdown = priceBreakdown(24000, "restaurant");
    expect(breakdown.lines.map((line) => line.amountPerKg)).toEqual([24000, 1500, 1920, 480, 720]);
    expect(breakdown.fisherReceivesPerKg).toBe(19380);
  });

  it("charges no platform fee to SPPG kitchens", () => {
    const breakdown = priceBreakdown(20000, "sppg");
    const fee = breakdown.lines.find((line) => line.key === "platform_fee");
    expect(fee?.amountPerKg).toBe(0);
    expect(breakdown.fisherReceivesPerKg).toBe(16300);
  });

  it("matches the business model formula 0,87 × P − 1.500 for private buyers", () => {
    expect(fisherPricePerKg(20000, "restaurant")).toBe(15900);
  });
});

describe("fairFisherPriceRange", () => {
  it("applies the grade multiplier and the 0,95 to 1,10 band, rounded to Rp100", () => {
    expect(fairFisherPriceRange(13000, "A")).toEqual({ low: 14200, high: 16400 });
    expect(fairFisherPriceRange(13000, "B")).toEqual({ low: 12400, high: 14300 });
    expect(fairFisherPriceRange(13000, "C")).toEqual({ low: 6800, high: 7900 });
  });
});

describe("suggestedBuyerPriceRange", () => {
  it("keeps the fisher at the grade target and the buyer under 85% of retail", () => {
    expect(
      suggestedBuyerPriceRange({ portPricePerKg: 13000, consumerPricePerKg: 30000, grade: "A", buyerKind: "restaurant" }),
    ).toEqual({ low: 19000, high: 25500 });
  });

  it("starts lower for SPPG because the platform fee is zero", () => {
    expect(
      suggestedBuyerPriceRange({ portPricePerKg: 13000, consumerPricePerKg: 30000, grade: "A", buyerKind: "sppg" }),
    ).toEqual({ low: 18500, high: 25500 });
  });
});

describe("breakEvenBuyerPrice", () => {
  it("matches the Rp16.700 break-even in MODEL_BISNIS for private buyers", () => {
    expect(breakEvenBuyerPrice(13000, "restaurant")).toBe(16700);
  });

  it("matches the Rp16.300 break-even for SPPG", () => {
    expect(breakEvenBuyerPrice(13000, "sppg")).toBe(16300);
  });
});

describe("gainOverPortPrice", () => {
  it("shows the +22% headline when buyers pay Rp20.000", () => {
    expect(Math.round(gainOverPortPrice(15900, 13000) * 100)).toBe(22);
  });
});

describe("roundUpTo", () => {
  it("does not bump exact multiples", () => {
    expect(roundUpTo(16300, 100)).toBe(16300);
    expect(roundUpTo(16301, 100)).toBe(16400);
  });
});
