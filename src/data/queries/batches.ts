import { freshClockStatus, remainingFreshMinutes, sppgIneligibilityReason, type FreshClockStatus } from "@/domain/cold-chain";
import { finalScore, roundToOneDecimal, type ParameterScores } from "@/domain/freshness-score";
import { lowestGrade, type Grade } from "@/domain/grade";
import { priceBreakdown, type PriceBreakdown } from "@/domain/pricing";
import { matchingBatches } from "@/domain/routing";
import { localDateOf } from "../demo-clock";
import type {
  Batch,
  Buyer,
  DemoDatabase,
  Fisher,
  FishSpecies,
  Grading,
  Landing,
  Order,
  Payment,
  Receipt,
  SpeciesId,
} from "../types";

export interface BatchContribution {
  landing: Landing;
  fisher: Fisher;
  grading: Grading;
  kg: number;
}

export interface BatchView {
  batch: Batch;
  order: Order;
  buyer: Buyer;
  species: FishSpecies;
  contributions: BatchContribution[];
  filledKg: number;
  targetKg: number;
  remainingKg: number;
  isFull: boolean;
  allIced: boolean;
  earliestLandedAt: string | null;
  freshRemainingMinutes: number | null;
  freshStatus: FreshClockStatus | null;
  batchGrade: Grade | null;
  averageParameters: ParameterScores | null;
  averageScore: number | null;
  breakdown: PriceBreakdown;
  receipt: Receipt | null;
  payment: Payment | null;
}

function weightedParameters(contributions: readonly BatchContribution[]): ParameterScores | null {
  const totalKg = contributions.reduce((sum, contribution) => sum + contribution.kg, 0);
  if (totalKg === 0) {
    return null;
  }
  const average = (key: keyof ParameterScores) =>
    roundToOneDecimal(
      contributions.reduce((sum, contribution) => sum + contribution.grading.parameters[key] * contribution.kg, 0) /
        totalKg,
    );
  return { eye: average("eye"), gill: average("gill"), odor: average("odor"), texture: average("texture") };
}

export function batchView(db: DemoDatabase, batchId: string, now: Date): BatchView | undefined {
  const batch = db.batches.find((candidate) => candidate.id === batchId);
  if (!batch) {
    return undefined;
  }
  const order = db.orders.find((candidate) => candidate.id === batch.orderId)!;
  const buyer = db.buyers.find((candidate) => candidate.id === order.buyerId)!;
  const species = db.species.find((candidate) => candidate.id === order.speciesId)!;
  const contributions = db.batchItems
    .filter((item) => item.batchId === batch.id)
    .map((item): BatchContribution => {
      const landing = db.landings.find((candidate) => candidate.id === item.landingId)!;
      return {
        landing,
        fisher: db.fishers.find((fisher) => fisher.id === landing.fisherId)!,
        grading: db.gradings.find((grading) => grading.landingId === landing.id)!,
        kg: item.kg,
      };
    })
    .sort((a, b) => a.landing.landedAt.localeCompare(b.landing.landedAt));
  const filledKg = contributions.reduce((sum, contribution) => sum + contribution.kg, 0);
  const earliest = contributions[0]?.landing ?? null;
  const allIced = contributions.every((contribution) => contribution.landing.iced);
  const averageParameters = weightedParameters(contributions);
  const isActive = batch.status !== "received" && batch.status !== "rejected";
  return {
    batch,
    order,
    buyer,
    species,
    contributions,
    filledKg,
    targetKg: order.targetKg,
    remainingKg: Math.max(0, order.targetKg - filledKg),
    isFull: filledKg >= order.targetKg,
    allIced,
    earliestLandedAt: earliest?.landedAt ?? null,
    freshRemainingMinutes:
      earliest && isActive
        ? remainingFreshMinutes(new Date(earliest.landedAt), now, species.freshnessWindow, allIced)
        : null,
    freshStatus:
      earliest && isActive ? freshClockStatus(new Date(earliest.landedAt), now, species.freshnessWindow, allIced) : null,
    batchGrade: contributions.length ? lowestGrade(contributions.map((contribution) => contribution.grading.grade)) : null,
    averageParameters,
    averageScore: averageParameters ? finalScore(averageParameters) : null,
    breakdown: priceBreakdown(order.pricePerKg, buyer.kind),
    receipt: db.receipts.find((receipt) => receipt.batchId === batch.id) ?? null,
    payment: db.payments.find((payment) => payment.batchId === batch.id) ?? null,
  };
}

export function batchViewByCode(db: DemoDatabase, code: string, now: Date): BatchView | undefined {
  const batch = db.batches.find((candidate) => candidate.code.toLowerCase() === code.trim().toLowerCase());
  return batch ? batchView(db, batch.id, now) : undefined;
}

export function batchesDeliveredOn(db: DemoDatabase, date: string, now: Date): BatchView[] {
  return db.batches
    .map((batch) => batchView(db, batch.id, now)!)
    .filter((view) => localDateOf(view.order.deliverAt) === date)
    .sort((a, b) => a.order.deliverAt.localeCompare(b.order.deliverAt));
}

export function batchesForBuyer(db: DemoDatabase, buyerId: string, now: Date): BatchView[] {
  return db.batches
    .map((batch) => batchView(db, batch.id, now)!)
    .filter((view) => view.order.buyerId === buyerId)
    .sort((a, b) => b.order.deliverAt.localeCompare(a.order.deliverAt));
}

export function suggestedBatches(
  db: DemoDatabase,
  landing: { speciesId: SpeciesId; grade: Grade; iced: boolean; landedAt: string },
  now: Date,
): BatchView[] {
  const species = db.species.find((candidate) => candidate.id === landing.speciesId)!;
  const sppgEligible =
    sppgIneligibilityReason({
      histamineRisk: species.histamineRisk,
      iced: landing.iced,
      landedAt: new Date(landing.landedAt),
      now,
      window: species.freshnessWindow,
    }) === null;
  const views = db.batches
    .filter((batch) => batch.status === "filling" || batch.status === "full")
    .map((batch) => batchView(db, batch.id, now)!);
  const candidates = matchingBatches(
    views.map((view) => ({
      id: view.batch.id,
      speciesId: view.order.speciesId,
      minimumGrade: view.order.minimumGrade,
      targetKg: view.targetKg,
      filledKg: view.filledKg,
      isSppg: view.buyer.kind === "sppg",
      acceptingLandings: view.batch.status === "filling",
    })),
    { speciesId: landing.speciesId, grade: landing.grade, sppgEligible },
  );
  return candidates.map((candidate) => views.find((view) => view.batch.id === candidate.id)!);
}

export function sppgBlockReason(
  db: DemoDatabase,
  landing: { speciesId: SpeciesId; iced: boolean; landedAt: string },
  now: Date,
) {
  const species = db.species.find((candidate) => candidate.id === landing.speciesId)!;
  return sppgIneligibilityReason({
    histamineRisk: species.histamineRisk,
    iced: landing.iced,
    landedAt: new Date(landing.landedAt),
    now,
    window: species.freshnessWindow,
  });
}

export function recentCouriers(db: DemoDatabase, limit = 3): string[] {
  const couriers = db.batches
    .filter((batch) => batch.departedAt && batch.checklist?.courier.trim())
    .sort((a, b) => b.departedAt!.localeCompare(a.departedAt!))
    .map((batch) => batch.checklist!.courier.trim());
  return [...new Set(couriers)].slice(0, limit);
}
