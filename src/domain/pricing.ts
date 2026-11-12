import type { SellableGrade } from "./grade";

export const BUYER_KINDS = ["sppg", "restaurant", "hotel", "catering"] as const;
export type BuyerKind = (typeof BUYER_KINDS)[number];

export const GRADE_PRICE_MULTIPLIER: Record<SellableGrade, number> = { A: 1.15, B: 1, C: 0.55 };
export const FAIR_RANGE_LOWER_FACTOR = 0.95;
export const FAIR_RANGE_UPPER_FACTOR = 1.1;
export const ICE_AND_TRANSPORT_PER_KG = 1500;
export const KUB_FUND_RATE = 0.08;
export const PLATFORM_FEE_RATE = 0.02;
export const SHRINKAGE_RESERVE_RATE = 0.03;
export const BUYER_CEILING_SHARE_OF_CONSUMER_PRICE = 0.85;

export interface PriceRange {
  low: number;
  high: number;
}

export type BreakdownLineKey =
  | "buyer_price"
  | "ice_and_transport"
  | "kub_fund"
  | "platform_fee"
  | "shrinkage_reserve";

export interface BreakdownLine {
  key: BreakdownLineKey;
  amountPerKg: number;
  rate: number | null;
}

export interface PriceBreakdown {
  lines: BreakdownLine[];
  fisherReceivesPerKg: number;
}

export function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function roundUpTo(value: number, step: number): number {
  return Math.ceil(value / step - 1e-9) * step;
}

export function platformFeeRateFor(buyerKind: BuyerKind): number {
  return buyerKind === "sppg" ? 0 : PLATFORM_FEE_RATE;
}

export function fisherShareRateFor(buyerKind: BuyerKind): number {
  return 1 - KUB_FUND_RATE - platformFeeRateFor(buyerKind) - SHRINKAGE_RESERVE_RATE;
}

export function targetFisherPrice(portPricePerKg: number, grade: SellableGrade): number {
  return portPricePerKg * GRADE_PRICE_MULTIPLIER[grade];
}

export function fairFisherPriceRange(portPricePerKg: number, grade: SellableGrade): PriceRange {
  const target = targetFisherPrice(portPricePerKg, grade);
  return {
    low: roundToNearest(target * FAIR_RANGE_LOWER_FACTOR, 100),
    high: roundToNearest(target * FAIR_RANGE_UPPER_FACTOR, 100),
  };
}

export function buyerPriceForFisherPrice(fisherPricePerKg: number, buyerKind: BuyerKind): number {
  return (fisherPricePerKg + ICE_AND_TRANSPORT_PER_KG) / fisherShareRateFor(buyerKind);
}

export function suggestedBuyerPriceRange(params: {
  portPricePerKg: number;
  consumerPricePerKg: number;
  grade: SellableGrade;
  buyerKind: BuyerKind;
}): PriceRange {
  const { portPricePerKg, consumerPricePerKg, grade, buyerKind } = params;
  const low = roundUpTo(buyerPriceForFisherPrice(targetFisherPrice(portPricePerKg, grade), buyerKind), 100);
  const high = roundToNearest(consumerPricePerKg * BUYER_CEILING_SHARE_OF_CONSUMER_PRICE, 100);
  return { low, high: Math.max(low, high) };
}

export function priceBreakdown(buyerPricePerKg: number, buyerKind: BuyerKind): PriceBreakdown {
  const feeRate = platformFeeRateFor(buyerKind);
  const lines: BreakdownLine[] = [
    { key: "buyer_price", amountPerKg: buyerPricePerKg, rate: null },
    { key: "ice_and_transport", amountPerKg: ICE_AND_TRANSPORT_PER_KG, rate: null },
    { key: "kub_fund", amountPerKg: Math.round(buyerPricePerKg * KUB_FUND_RATE), rate: KUB_FUND_RATE },
    { key: "platform_fee", amountPerKg: Math.round(buyerPricePerKg * feeRate), rate: feeRate },
    {
      key: "shrinkage_reserve",
      amountPerKg: Math.round(buyerPricePerKg * SHRINKAGE_RESERVE_RATE),
      rate: SHRINKAGE_RESERVE_RATE,
    },
  ];
  const deductions = lines.slice(1).reduce((sum, line) => sum + line.amountPerKg, 0);
  return { lines, fisherReceivesPerKg: buyerPricePerKg - deductions };
}

export function fisherPricePerKg(buyerPricePerKg: number, buyerKind: BuyerKind): number {
  return priceBreakdown(buyerPricePerKg, buyerKind).fisherReceivesPerKg;
}

export function breakEvenBuyerPrice(portPricePerKg: number, buyerKind: BuyerKind): number {
  return roundUpTo(buyerPriceForFisherPrice(portPricePerKg, buyerKind), 100);
}

export function gainOverPortPrice(fisherPrice: number, portPricePerKg: number): number {
  return (fisherPrice - portPricePerKg) / portPricePerKg;
}
