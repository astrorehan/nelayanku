import type { SppgIneligibilityReason } from "@/domain/cold-chain";
import { isGradeAtLeast, type Grade, type SellableGrade } from "@/domain/grade";
import { fairFisherPriceRange, GRADE_PRICE_MULTIPLIER, roundToNearest, type PriceRange } from "@/domain/pricing";
import { localDateOf } from "../demo-clock";
import type { DemoDatabase, Landing } from "../types";
import { batchView, sppgBlockReason, suggestedBatches, type BatchView } from "./batches";
import { averagePortPrice } from "./prices";

export type RouteChoice =
  | { kind: "batch"; view: BatchView; kg: number; leftoverKg: number; leftoverPricePerKg: number }
  | { kind: "port_auction"; kg: number; pricePerKg: number }
  | { kind: "processing"; kg: number; pricePerKg: number }
  | { kind: "not_for_consumption"; kg: number };

export interface SppgBlock {
  reason: SppgIneligibilityReason;
  buyerName: string;
}

export interface DestinationPlan {
  recommended: RouteChoice;
  alternatives: RouteChoice[];
  sppgBlock: SppgBlock | null;
}

type RoutableLanding = Pick<Landing, "speciesId" | "weightKg" | "iced" | "landedAt">;

export function processingPricePerKg(portPricePerKg: number): number {
  return roundToNearest(portPricePerKg * GRADE_PRICE_MULTIPLIER.C, 50);
}

function blockedSppgOrder(db: DemoDatabase, landing: RoutableLanding, grade: Grade, now: Date): SppgBlock | null {
  const reason = sppgBlockReason(db, landing, now);
  if (!reason) {
    return null;
  }
  const blocked = db.batches
    .filter((batch) => batch.status === "filling")
    .map((batch) => batchView(db, batch.id, now)!)
    .find(
      (view) =>
        view.buyer.kind === "sppg" &&
        view.order.speciesId === landing.speciesId &&
        view.remainingKg > 0 &&
        isGradeAtLeast(grade, view.order.minimumGrade),
    );
  return blocked ? { reason, buyerName: blocked.buyer.name } : null;
}

export function destinationPlan(db: DemoDatabase, landing: RoutableLanding, grade: Grade, now: Date): DestinationPlan {
  const kg = landing.weightKg;
  if (grade === "REJECT") {
    return { recommended: { kind: "not_for_consumption", kg }, alternatives: [], sppgBlock: null };
  }
  const portPricePerKg = averagePortPrice(db, landing.speciesId, localDateOf(now)).pricePerKg;
  if (grade === "C") {
    return { recommended: { kind: "processing", kg, pricePerKg: processingPricePerKg(portPricePerKg) }, alternatives: [], sppgBlock: null };
  }
  const portAuction: RouteChoice = { kind: "port_auction", kg, pricePerKg: portPricePerKg };
  const batches = suggestedBatches(db, { ...landing, grade }, now).map((view): RouteChoice => {
    const batchedKg = Math.min(kg, view.remainingKg);
    return { kind: "batch", view, kg: batchedKg, leftoverKg: kg - batchedKg, leftoverPricePerKg: portPricePerKg };
  });
  const [first, ...others] = batches;
  return {
    recommended: first ?? portAuction,
    alternatives: first ? [...others, portAuction] : [],
    sppgBlock: blockedSppgOrder(db, landing, grade, now),
  };
}

export function estimatedPayout(choice: RouteChoice): number {
  switch (choice.kind) {
    case "batch":
      return choice.kg * choice.view.breakdown.fisherReceivesPerKg + choice.leftoverKg * choice.leftoverPricePerKg;
    case "port_auction":
    case "processing":
      return choice.kg * choice.pricePerKg;
    case "not_for_consumption":
      return 0;
  }
}

export interface FairPrice {
  range: PriceRange;
  portPricePerKg: number;
  fromDate: string;
  toDate: string;
  source: string;
  simulated: boolean;
}

export function fairPriceFor(db: DemoDatabase, speciesId: Landing["speciesId"], grade: SellableGrade, now: Date): FairPrice {
  const port = averagePortPrice(db, speciesId, localDateOf(now));
  return {
    range: fairFisherPriceRange(port.pricePerKg, grade),
    portPricePerKg: port.pricePerKg,
    fromDate: port.fromDate,
    toDate: port.toDate,
    source: port.source,
    simulated: port.simulated,
  };
}
