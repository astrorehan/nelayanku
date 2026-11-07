import { describe, expect, it } from "vitest";
import { DEMO_START } from "../demo-clock";
import { createSeedDatabase } from "../seed";
import { roleCardStats } from "./role-cards";

const db = createSeedDatabase();

describe("roleCardStats", () => {
  const stats = roleCardStats(db, DEMO_START);

  it("gives every role exactly two non-empty numbers", () => {
    for (const pair of Object.values(stats)) {
      expect(pair).toHaveLength(2);
      for (const stat of pair) {
        expect(stat.label).not.toBe("");
        expect(stat.value).not.toBe("");
      }
    }
  });

  it("counts today's landings for the operator from the seed", () => {
    expect(stats["/kub"][0].value).toMatch(/ dari [0-9]+ catatan$/);
    expect(Number.parseInt(stats["/kub"][0].value, 10)).toBeGreaterThan(0);
  });

  it("shows Darman's remaining loan as rupiah", () => {
    expect(stats["/nelayan"][1].label).toBe("Sisa utang");
    expect(stats["/nelayan"][1].value).toMatch(/^Rp/);
  });
});
