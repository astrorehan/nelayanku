import { describe, expect, it } from "vitest";
import { destinationsForGrade, matchingBatches, type BatchCandidate } from "./routing";

const batch = (overrides: Partial<BatchCandidate>): BatchCandidate => ({
  id: "tongkol-a",
  speciesId: "tongkol",
  minimumGrade: "A",
  targetKg: 40,
  filledKg: 22,
  isSppg: true,
  acceptingLandings: true,
  ...overrides,
});

describe("destinationsForGrade", () => {
  it("sends C to processing and REJECT out of the food chain", () => {
    expect(destinationsForGrade("C")).toEqual(["processing"]);
    expect(destinationsForGrade("REJECT")).toEqual(["not_for_consumption"]);
  });
});

describe("matchingBatches", () => {
  const landing = { speciesId: "tongkol", grade: "A" as const, sppgEligible: true };

  it("suggests the batch closest to full first", () => {
    const batches = [batch({ id: "wide", targetKg: 100, filledKg: 10 }), batch({ id: "nearly-full" })];
    expect(matchingBatches(batches, landing).map((b) => b.id)).toEqual(["nearly-full", "wide"]);
  });

  it("never puts grade C or REJECT fish into a batch", () => {
    expect(matchingBatches([batch({ minimumGrade: "B" })], { ...landing, grade: "C" })).toEqual([]);
    expect(matchingBatches([batch({ minimumGrade: "B" })], { ...landing, grade: "REJECT" })).toEqual([]);
  });

  it("respects the minimum grade and species", () => {
    expect(matchingBatches([batch({})], { ...landing, grade: "B" })).toEqual([]);
    expect(matchingBatches([batch({})], { ...landing, speciesId: "kembung" })).toEqual([]);
  });

  it("keeps fish that fail the histamine rule out of SPPG batches", () => {
    expect(matchingBatches([batch({})], { ...landing, sppgEligible: false })).toEqual([]);
    expect(matchingBatches([batch({ isSppg: false })], { ...landing, sppgEligible: false })).toHaveLength(1);
  });

  it("skips full and closed batches", () => {
    expect(matchingBatches([batch({ filledKg: 40 }), batch({ acceptingLandings: false })], landing)).toEqual([]);
  });
});
