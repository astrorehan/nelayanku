import { describe, expect, it } from "vitest";
import { computeCostOfGoods, suggestedRetailPrice } from "./cost-of-goods";

const driedTongkolRun = {
  rawFishKg: 12,
  rawFishPricePerKg: 7150,
  yieldRatio: 0.45,
  packNetWeightGrams: 250,
  seasoningCost: 12000,
  fuelCost: 18000,
  laborCost: 30000,
  packagingCostPerPack: 1500,
};

describe("computeCostOfGoods", () => {
  it("turns 12 kg of grade C tongkol into 21 packs of 250 g", () => {
    const cost = computeCostOfGoods(driedTongkolRun);
    expect(cost.finishedGrams).toBe(5400);
    expect(cost.packCount).toBe(21);
    expect(cost.rawFishCost).toBe(85800);
    expect(cost.totalCost).toBe(177300);
    expect(cost.costPerPack).toBe(8443);
  });

  it("returns zero cost per pack when nothing fills a pack", () => {
    expect(computeCostOfGoods({ ...driedTongkolRun, rawFishKg: 0.2 }).costPerPack).toBe(0);
  });

  it("refuses an impossible yield", () => {
    expect(() => computeCostOfGoods({ ...driedTongkolRun, yieldRatio: 1.4 })).toThrow();
  });
});

describe("suggestedRetailPrice", () => {
  it("adds the margin and rounds up to the next Rp500", () => {
    expect(suggestedRetailPrice(8443, 0.3)).toBe(11000);
    expect(suggestedRetailPrice(10000, 0.25)).toBe(12500);
  });
});

it("refuses zero pack weight, negative costs and non-finite production inputs", () => {
  for (const values of [{ packNetWeightGrams: 0 }, { fuelCost: -1 }, { rawFishKg: NaN }, { rawFishPricePerKg: Infinity }]) {
    expect(() => computeCostOfGoods({ ...driedTongkolRun, ...values })).toThrow();
  }
});
