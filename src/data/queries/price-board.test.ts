import { describe, expect, it } from "vitest";
import { DEMO_DATE } from "../demo-clock";
import { createSeedDatabase } from "../seed";
import { estimateCatchValue, offerVerdict, priceBoardForAllSpecies, speciesPriceBoard } from "./price-board";

const db = createSeedDatabase();

describe("price board", () => {
  const board = speciesPriceBoard(db, "tongkol", DEMO_DATE);

  it("carries the latest port and consumer quote with date and source", () => {
    expect(board.port.pricePerKg).toBe(13000);
    expect(board.port.date).toBe(DEMO_DATE);
    expect(board.port.source).toBe("PIPP KKP");
    expect(board.consumer.pricePerKg).toBe(30000);
    expect(board.consumer.simulated).toBe(true);
  });

  it("orders the fair fisher range by grade", () => {
    expect(board.fairFisherRange.A.low).toBeGreaterThan(board.fairFisherRange.B.low);
    expect(board.fairFisherRange.B.low).toBeGreaterThan(board.fairFisherRange.C.low);
    expect(board.fairFisherRange.B.low).toBeLessThanOrEqual(board.fairFisherRange.B.high);
  });

  it("keeps the suggested buyer range above the fair fisher range", () => {
    expect(board.suggestedBuyerRange.B.low).toBeGreaterThan(board.fairFisherRange.B.high);
  });

  it("returns a 30-day series ending today, oldest first", () => {
    expect(board.series).toHaveLength(30);
    expect(board.series[29].date).toBe(DEMO_DATE);
    expect(board.series[0].date < board.series[1].date).toBe(true);
    expect(board.series.every((point) => point.consumerPricePerKg !== null)).toBe(true);
  });

  it("reports the change against the previous day", () => {
    expect(board.portChange).not.toBeNull();
    expect(board.portChange!.amount).toBe(board.port.pricePerKg - board.series[28].portPricePerKg);
  });

  it("has no change when only one day of data exists", () => {
    const first = db.referencePrices.filter((price) => price.date === board.series[0].date);
    const thin = { ...db, referencePrices: first };
    expect(speciesPriceBoard(thin, "tongkol", board.series[0].date).portChange).toBeNull();
  });

  it("builds a board for every species", () => {
    expect(
      priceBoardForAllSpecies(db, DEMO_DATE)
        .map((entry) => entry.speciesId)
        .sort(),
    ).toEqual(["cakalang", "kembung", "tongkol"]);
  });

  it("gives SPPG a lower floor than a restaurant", () => {
    const restaurant = speciesPriceBoard(db, "tongkol", DEMO_DATE, "restaurant");
    expect(board.suggestedBuyerRange.A.low).toBeLessThan(restaurant.suggestedBuyerRange.A.low);
  });
});

describe("offer verdict", () => {
  const range = { low: 14000, high: 16000 };
  it("classifies below, within and above", () => {
    expect(offerVerdict(13900, range)).toBe("below");
    expect(offerVerdict(14000, range)).toBe("within");
    expect(offerVerdict(16000, range)).toBe("within");
    expect(offerVerdict(16100, range)).toBe("above");
  });
});

describe("catch estimate", () => {
  it("multiplies kg by the grade range and compares with the port total", () => {
    const board = speciesPriceBoard(db, "tongkol", DEMO_DATE);
    const estimate = estimateCatchValue(10, "B", board);
    expect(estimate.fairLow).toBe(10 * board.fairFisherRange.B.low);
    expect(estimate.fairHigh).toBe(10 * board.fairFisherRange.B.high);
    expect(estimate.portTotal).toBe(130000);
  });
});
