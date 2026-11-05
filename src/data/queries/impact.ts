import { priceBreakdown } from "@/domain/pricing";
import { localDateOf } from "../demo-clock";
import type { DemoDatabase, LandingDestination, SpeciesId } from "../types";

export interface DateRange {
  fromDate: string;
  toDate: string;
}

export interface PriceComparisonPoint {
  date: string;
  fisherPricePerKg: number | null;
  portPricePerKg: number;
}

export interface ImpactMetrics {
  range: DateRange;
  deliveredBatchCount: number;
  landingCount: number;
  kgSoldViaOrders: number;
  extraIncomeVsPortPrice: number;
  processedKg: number;
  onTimePayments: { onTime: number; total: number };
  activeFishers: { active: number; total: number };
  destinationKg: Record<LandingDestination, number>;
  priceComparison: PriceComparisonPoint[];
}

const inRange = (date: string, { fromDate, toDate }: DateRange) => date >= fromDate && date <= toDate;

function portPrice(db: DemoDatabase, speciesId: SpeciesId, date: string): number {
  const price = db.referencePrices.find(
    (candidate) => candidate.speciesId === speciesId && candidate.kind === "port" && candidate.date === date,
  );
  return price?.pricePerKg ?? 0;
}

export function impactMetrics(db: DemoDatabase, range: DateRange, comparisonSpecies: SpeciesId = "tongkol"): ImpactMetrics {
  const receivedBatches = db.batches.filter((batch) => {
    const order = db.orders.find((candidate) => candidate.id === batch.orderId)!;
    return batch.status === "received" && inRange(localDateOf(order.deliverAt), range);
  });

  let kgSoldViaOrders = 0;
  let extraIncomeVsPortPrice = 0;
  const fisherPriceByDate = new Map<string, { kg: number; amount: number }>();
  for (const batch of receivedBatches) {
    const order = db.orders.find((candidate) => candidate.id === batch.orderId)!;
    const buyer = db.buyers.find((candidate) => candidate.id === order.buyerId)!;
    const receipt = db.receipts.find((candidate) => candidate.batchId === batch.id);
    const date = localDateOf(order.deliverAt);
    const fisherPrice = priceBreakdown(order.pricePerKg, buyer.kind).fisherReceivesPerKg;
    const acceptedKg = receipt?.acceptedKg ?? 0;
    kgSoldViaOrders += acceptedKg;
    extraIncomeVsPortPrice += acceptedKg * (fisherPrice - portPrice(db, order.speciesId, date));
    if (order.speciesId === comparisonSpecies) {
      const point = fisherPriceByDate.get(date) ?? { kg: 0, amount: 0 };
      fisherPriceByDate.set(date, { kg: point.kg + acceptedKg, amount: point.amount + acceptedKg * fisherPrice });
    }
  }

  const landings = db.landings.filter((landing) => inRange(localDateOf(landing.landedAt), range));
  const destinationKg: Record<LandingDestination, number> = {
    batch: 0,
    port_auction: 0,
    processing: 0,
    not_for_consumption: 0,
  };
  for (const landing of landings) {
    if (!landing.destination) {
      continue;
    }
    if (landing.destination === "batch") {
      const batched = db.batchItems
        .filter((item) => item.landingId === landing.id)
        .reduce((sum, item) => sum + item.kg, 0);
      destinationKg.batch += batched;
      destinationKg.port_auction += landing.weightKg - batched;
    } else {
      destinationKg[landing.destination] += landing.weightKg;
    }
  }

  const payments = db.payments.filter((payment) => {
    const batch = receivedBatches.find((candidate) => candidate.id === payment.batchId);
    return batch !== undefined;
  });

  const processedKg = db.materials
    .filter((material) => material.takenAt && inRange(localDateOf(material.takenAt), range))
    .reduce((sum, material) => sum + material.kg, 0);

  const priceComparison = db.referencePrices
    .filter((price) => price.speciesId === comparisonSpecies && price.kind === "port" && inRange(price.date, range))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((price): PriceComparisonPoint => {
      const point = fisherPriceByDate.get(price.date);
      return {
        date: price.date,
        portPricePerKg: price.pricePerKg,
        fisherPricePerKg: point && point.kg > 0 ? Math.round(point.amount / point.kg) : null,
      };
    });

  return {
    range,
    deliveredBatchCount: receivedBatches.length,
    landingCount: landings.length,
    kgSoldViaOrders,
    extraIncomeVsPortPrice: Math.round(extraIncomeVsPortPrice),
    processedKg,
    onTimePayments: {
      onTime: payments.filter((payment) => payment.status === "paid").length,
      total: payments.length,
    },
    activeFishers: {
      active: new Set(landings.map((landing) => landing.fisherId)).size,
      total: db.fishers.length,
    },
    destinationKg,
    priceComparison,
  };
}
