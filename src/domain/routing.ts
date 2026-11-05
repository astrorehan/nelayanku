import { isGradeAtLeast, type Grade } from "./grade";

export type Destination = "institutional_batch" | "regular_market" | "processing" | "not_for_consumption";

export function destinationsForGrade(grade: Grade): Destination[] {
  switch (grade) {
    case "A":
    case "B":
      return ["institutional_batch", "regular_market"];
    case "C":
      return ["processing"];
    case "REJECT":
      return ["not_for_consumption"];
  }
}

export interface BatchCandidate {
  id: string;
  speciesId: string;
  minimumGrade: Grade;
  targetKg: number;
  filledKg: number;
  isSppg: boolean;
  acceptingLandings: boolean;
}

export interface LandingToRoute {
  speciesId: string;
  grade: Grade;
  sppgEligible: boolean;
}

export function remainingCapacityKg(batch: BatchCandidate): number {
  return Math.max(0, batch.targetKg - batch.filledKg);
}

export function matchingBatches<T extends BatchCandidate>(batches: readonly T[], landing: LandingToRoute): T[] {
  if (!destinationsForGrade(landing.grade).includes("institutional_batch")) {
    return [];
  }
  return batches
    .filter(
      (batch) =>
        batch.acceptingLandings &&
        batch.speciesId === landing.speciesId &&
        isGradeAtLeast(landing.grade, batch.minimumGrade) &&
        remainingCapacityKg(batch) > 0 &&
        (!batch.isSppg || landing.sppgEligible),
    )
    .sort((a, b) => remainingCapacityKg(a) - remainingCapacityKg(b));
}
