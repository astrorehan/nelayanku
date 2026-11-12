import type { DemoDatabase, ReferencePrice, SpeciesId } from "../types";
import type { SellableGrade } from "@/domain/grade";
import { fairFisherPriceRange, suggestedBuyerPriceRange, type BuyerKind, type PriceRange } from "@/domain/pricing";
import { averagePortPrice, latestReferencePrice, priceSeries } from "./prices";

export const PRICE_BOARD_GRADES: readonly SellableGrade[] = ["A", "B", "C"];
export const PRICE_BOARD_DAYS = 30;

export interface PriceQuote {
  pricePerKg: number;
  date: string;
  source: string;
  location: string;
  simulated: boolean;
}

export interface PriceTrendPoint {
  date: string;
  portPricePerKg: number;
  consumerPricePerKg: number | null;
}

export interface SpeciesPriceBoard {
  speciesId: SpeciesId;
  speciesName: string;
  port: PriceQuote;
  /** Rounded 7-day average used by the pricing rules. */
  portAverage: { pricePerKg: number; fromDate: string; toDate: string };
  consumer: PriceQuote;
  /** Latest port price minus the previous available port price; null when there is no earlier day. */
  portChange: { amount: number; rate: number; previousDate: string } | null;
  fairFisherRange: Record<SellableGrade, PriceRange>;
  suggestedBuyerRange: Record<SellableGrade, PriceRange>;
  buyerKind: BuyerKind;
  series: PriceTrendPoint[];
}

function quoteOf(price: ReferencePrice): PriceQuote {
  return {
    pricePerKg: price.pricePerKg,
    date: price.date,
    source: price.source,
    location: price.location,
    simulated: price.simulated,
  };
}

function perGrade<T>(build: (grade: SellableGrade) => T): Record<SellableGrade, T> {
  return { A: build("A"), B: build("B"), C: build("C") };
}

export function speciesPriceBoard(
  db: DemoDatabase,
  speciesId: SpeciesId,
  date: string,
  buyerKind: BuyerKind = "sppg",
): SpeciesPriceBoard {
  const latestPort = latestReferencePrice(db, speciesId, "port", date);
  const consumer = latestReferencePrice(db, speciesId, "consumer", date);
  const average = averagePortPrice(db, speciesId, date);

  const portHistory = priceSeries(db, speciesId, "port").filter((price) => price.date <= date);
  const previous = portHistory.length >= 2 ? portHistory[portHistory.length - 2] : null;
  const portChange = previous
    ? {
        amount: latestPort.pricePerKg - previous.pricePerKg,
        rate: (latestPort.pricePerKg - previous.pricePerKg) / previous.pricePerKg,
        previousDate: previous.date,
      }
    : null;

  const consumerByDate = new Map(
    priceSeries(db, speciesId, "consumer")
      .filter((price) => price.date <= date)
      .map((price) => [price.date, price.pricePerKg] as const),
  );
  const series = portHistory.slice(-PRICE_BOARD_DAYS).map((price) => ({
    date: price.date,
    portPricePerKg: price.pricePerKg,
    consumerPricePerKg: consumerByDate.get(price.date) ?? null,
  }));

  return {
    speciesId,
    speciesName: db.species.find((species) => species.id === speciesId)?.name ?? speciesId,
    port: quoteOf(latestPort),
    portAverage: { pricePerKg: average.pricePerKg, fromDate: average.fromDate, toDate: average.toDate },
    consumer: quoteOf(consumer),
    portChange,
    fairFisherRange: perGrade((grade) => fairFisherPriceRange(average.pricePerKg, grade)),
    suggestedBuyerRange: perGrade((grade) =>
      suggestedBuyerPriceRange({
        portPricePerKg: average.pricePerKg,
        consumerPricePerKg: consumer.pricePerKg,
        grade,
        buyerKind,
      }),
    ),
    buyerKind,
    series,
  };
}

export function priceBoardForAllSpecies(db: DemoDatabase, date: string, buyerKind: BuyerKind = "sppg"): SpeciesPriceBoard[] {
  return db.species.map((species) => speciesPriceBoard(db, species.id, date, buyerKind));
}

export type OfferVerdict = "below" | "within" | "above";

export function offerVerdict(offerPerKg: number, range: PriceRange): OfferVerdict {
  if (offerPerKg < range.low) {
    return "below";
  }
  return offerPerKg > range.high ? "above" : "within";
}

export interface CatchEstimate {
  fairLow: number;
  fairHigh: number;
  /** What the same kilograms would fetch at the latest port price, ungraded. */
  portTotal: number;
  /** Midpoint of the fair range minus the port total. */
  difference: number;
}

export function estimateCatchValue(kg: number, grade: SellableGrade, board: SpeciesPriceBoard): CatchEstimate {
  const range = board.fairFisherRange[grade];
  const portTotal = Math.round(kg * board.port.pricePerKg);
  return {
    fairLow: Math.round(kg * range.low),
    fairHigh: Math.round(kg * range.high),
    portTotal,
    difference: Math.round((kg * (range.low + range.high)) / 2) - portTotal,
  };
}
