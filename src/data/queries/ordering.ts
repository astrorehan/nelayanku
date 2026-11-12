import type { SellableGrade } from "@/domain/grade";
import { breakEvenBuyerPrice, suggestedBuyerPriceRange, type BuyerKind, type PriceRange } from "@/domain/pricing";
import { addDays, demoTime, localDateOf } from "../demo-clock";
import type { DemoDatabase, SpeciesId } from "../types";
import { averagePortPrice, latestReferencePrice } from "./prices";

export const ORDER_CUTOFF_TIME = "20:00";
export const DELIVERY_TIMES = ["06:30", "08:00", "09:00"] as const;

export function orderCutoff(now: Date): Date {
  return new Date(demoTime(localDateOf(now), ORDER_CUTOFF_TIME));
}

export function nextDeliveryDate(now: Date): string {
  const today = localDateOf(now);
  return addDays(today, now.getTime() < orderCutoff(now).getTime() ? 1 : 2);
}

export interface BuyerPriceGuide {
  range: PriceRange;
  breakEvenPricePerKg: number;
  portPricePerKg: number;
  consumerPricePerKg: number;
  lastPricePaid: number | null;
  priceDate: string;
}

export function buyerPriceGuide(
  db: DemoDatabase,
  params: { buyerId: string; buyerKind: BuyerKind; speciesId: SpeciesId; grade: SellableGrade; now: Date },
): BuyerPriceGuide {
  const today = localDateOf(params.now);
  const port = averagePortPrice(db, params.speciesId, today);
  const consumer = latestReferencePrice(db, params.speciesId, "consumer", today);
  const lastOrder = db.orders
    .filter((order) => order.buyerId === params.buyerId && order.speciesId === params.speciesId)
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt))[0];
  return {
    range: suggestedBuyerPriceRange({
      portPricePerKg: port.pricePerKg,
      consumerPricePerKg: consumer.pricePerKg,
      grade: params.grade,
      buyerKind: params.buyerKind,
    }),
    breakEvenPricePerKg: breakEvenBuyerPrice(port.pricePerKg, params.buyerKind),
    portPricePerKg: port.pricePerKg,
    consumerPricePerKg: consumer.pricePerKg,
    lastPricePaid: lastOrder?.pricePerKg ?? null,
    priceDate: port.toDate,
  };
}
