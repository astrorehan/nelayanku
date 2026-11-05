import { freshClockStatus, remainingFreshMinutes, type FreshClockStatus } from "@/domain/cold-chain";
import { localDateOf } from "../demo-clock";
import type { DemoDatabase, Fisher, FishSpecies, Grading, Landing, LandingDestination } from "../types";
import { batchView, type BatchView } from "./batches";
import { averagePortPrice } from "./prices";

export interface LandingView {
  landing: Landing;
  fisher: Fisher;
  species: FishSpecies;
  grading: Grading | null;
  batchedKg: number;
}

export function landingView(db: DemoDatabase, landingId: string): LandingView | undefined {
  const landing = db.landings.find((candidate) => candidate.id === landingId);
  if (!landing) {
    return undefined;
  }
  return {
    landing,
    fisher: db.fishers.find((fisher) => fisher.id === landing.fisherId)!,
    species: db.species.find((species) => species.id === landing.speciesId)!,
    grading: db.gradings.find((grading) => grading.landingId === landing.id) ?? null,
    batchedKg: db.batchItems
      .filter((item) => item.landingId === landing.id)
      .reduce((sum, item) => sum + item.kg, 0),
  };
}

export function landingsOnDate(db: DemoDatabase, date: string): LandingView[] {
  return db.landings
    .filter((landing) => localDateOf(landing.landedAt) === date)
    .sort((a, b) => b.landedAt.localeCompare(a.landedAt))
    .map((landing) => landingView(db, landing.id)!);
}

export interface FreshnessAlert {
  view: LandingView;
  remainingMinutes: number;
  status: FreshClockStatus;
}

export function freshnessAlerts(db: DemoDatabase, now: Date): FreshnessAlert[] {
  return landingsOnDate(db, localDateOf(now))
    .filter((view) => view.grading === null && view.landing.destination === null)
    .map((view) => ({
      view,
      remainingMinutes: remainingFreshMinutes(
        new Date(view.landing.landedAt),
        now,
        view.species.freshnessWindow,
        view.landing.iced,
      ),
      status: freshClockStatus(new Date(view.landing.landedAt), now, view.species.freshnessWindow, view.landing.iced),
    }))
    .sort((a, b) => a.remainingMinutes - b.remainingMinutes);
}

export function resumableLanding(db: DemoDatabase, landingId: string): Landing | null {
  const view = landingView(db, landingId);
  return view && view.grading === null && view.landing.destination === null ? view.landing : null;
}

export interface LandingOutcome {
  view: LandingView;
  grading: Grading;
  destination: LandingDestination;
  batch: BatchView | null;
  batchedKg: number;
  leftoverKg: number;
  payoutEstimate: number;
}

export function landingOutcome(db: DemoDatabase, landingId: string, now: Date): LandingOutcome | undefined {
  const view = landingView(db, landingId);
  const destination = view?.landing.destination;
  if (!view?.grading || !destination) {
    return undefined;
  }
  const { landing } = view;
  const portPricePerKg = averagePortPrice(db, landing.speciesId, localDateOf(landing.landedAt)).pricePerKg;
  const batchItem = db.batchItems.find((item) => item.landingId === landing.id);
  const batch = batchItem ? (batchView(db, batchItem.batchId, now) ?? null) : null;
  const leftoverKg = batch ? landing.weightKg - view.batchedKg : 0;
  const material = db.materials.find((candidate) => candidate.landingId === landing.id);
  const payoutByDestination: Record<LandingDestination, number> = {
    batch: batch ? view.batchedKg * batch.breakdown.fisherReceivesPerKg + leftoverKg * portPricePerKg : 0,
    port_auction: landing.weightKg * portPricePerKg,
    processing: material ? material.kg * material.pricePerKg : 0,
    not_for_consumption: 0,
  };
  return {
    view,
    grading: view.grading,
    destination,
    batch,
    batchedKg: view.batchedKg,
    leftoverKg,
    payoutEstimate: payoutByDestination[destination],
  };
}
