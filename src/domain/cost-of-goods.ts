import { roundUpTo } from "./pricing";

export const RETAIL_PRICE_STEP = 500;

export interface ProductionRun {
  rawFishKg: number;
  rawFishPricePerKg: number;
  yieldRatio: number;
  packNetWeightGrams: number;
  seasoningCost: number;
  fuelCost: number;
  laborCost: number;
  packagingCostPerPack: number;
}

export interface CostOfGoods {
  finishedGrams: number;
  packCount: number;
  rawFishCost: number;
  packagingCost: number;
  totalCost: number;
  costPerPack: number;
}

export function computeCostOfGoods(run: ProductionRun): CostOfGoods {
  if (Object.values(run).some((value) => !Number.isFinite(value) || value < 0) || run.packNetWeightGrams <= 0) {
    throw new Error("Production amounts must be finite and non-negative; pack weight must be positive");
  }
  if (run.yieldRatio <= 0 || run.yieldRatio > 1) {
    throw new Error("yieldRatio must be between 0 and 1");
  }
  const finishedGrams = Math.round(run.rawFishKg * 1000 * run.yieldRatio);
  const packCount = Math.floor(finishedGrams / run.packNetWeightGrams);
  const rawFishCost = Math.round(run.rawFishKg * run.rawFishPricePerKg);
  const packagingCost = packCount * run.packagingCostPerPack;
  const totalCost = rawFishCost + run.seasoningCost + run.fuelCost + run.laborCost + packagingCost;
  return {
    finishedGrams,
    packCount,
    rawFishCost,
    packagingCost,
    totalCost,
    costPerPack: packCount > 0 ? Math.round(totalCost / packCount) : 0,
  };
}

export function suggestedRetailPrice(costPerPack: number, marginRate: number): number {
  return roundUpTo(costPerPack * (1 + marginRate), RETAIL_PRICE_STEP);
}
