import { freshClockStatus, remainingFreshMinutes, type FreshClockStatus } from "@/domain/cold-chain";
import { localDateOf } from "../demo-clock";
import type { DemoDatabase, Fisher, FishSpecies, Grading, Landing } from "../types";

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
