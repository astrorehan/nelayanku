import { describe, expect, it } from "vitest";
import { DEMO_START } from "../demo-clock";
import { createSeedDatabase } from "../seed";
import { parseTrackingCode, publicBatchTrace } from "./tracking";

const db = createSeedDatabase();
const batch = db.batches.find(
  (candidate) => candidate.status === "in_transit",
)!;

describe("public trace", () => {
  it("exports only anonymized contributions without contact or financial data", () => {
    const trace = publicBatchTrace(db, batch.code.toLowerCase(), DEMO_START)!;
    const serialized = JSON.stringify(trace);
    expect(trace.contributions.length).toBeGreaterThan(0);
    expect(
      trace.contributions.every((item) =>
        /^Nelayan #\d+$/.test(item.fisherLabel),
      ),
    ).toBe(true);
    for (const fisher of db.fishers) {
      expect(serialized).not.toContain(fisher.name);
      if (fisher.whatsapp) expect(serialized).not.toContain(fisher.whatsapp);
    }
    for (const field of [
      "ledger",
      "pricePerKg",
      "buyerId",
      "fisherId",
      "address",
      "payment",
    ])
      expect(serialized).not.toContain(`"${field}"`);
    expect(trace.contributions.every((item) => item.hashMatches)).toBe(true);
  });

  it("detects changes to the original grading instead of presenting a valid seal", () => {
    const changed = structuredClone(db);
    const landingId = changed.batchItems.find(
      (item) => item.batchId === batch.id,
    )!.landingId;
    changed.gradings.find((item) => item.landingId === landingId)!.finalScore =
      1;
    expect(
      publicBatchTrace(changed, batch.code, DEMO_START)!.contributions.some(
        (item) => !item.hashMatches,
      ),
    ).toBe(true);
  });

  it("does not publish private text entered as an override reason", () => {
    const changed = structuredClone(db);
    const landingId = changed.batchItems.find(
      (item) => item.batchId === batch.id,
    )!.landingId;
    changed.gradings.find(
      (item) => item.landingId === landingId,
    )!.overrideReason = "Catatan pribadi Pak Darman 08123456789";
    const exported = JSON.stringify(
      publicBatchTrace(changed, batch.code, DEMO_START),
    );
    expect(exported).not.toContain("Pak Darman");
    expect(exported).not.toContain("08123456789");
  });

  it("returns no evidence for an unknown code", () => {
    expect(publicBatchTrace(db, "tidak-ada", DEMO_START)).toBeNull();
  });
});

describe("tracking input", () => {
  it("accepts a label code and pasted QR URL", () => {
    expect(parseTrackingCode(` ${batch.code.toLowerCase()} `)).toBe(batch.code);
    expect(
      parseTrackingCode(`https://example.org/lacak/${batch.code}?from=qr`),
    ).toBe(batch.code);
  });
  it("rejects executable URLs, path traversal, and unrelated pages", () => {
    for (const value of [
      "javascript:alert(1)",
      "../../kub",
      "https://example.org/kub",
      "<script>",
      "",
    ])
      expect(parseTrackingCode(value)).toBeNull();
  });
});
