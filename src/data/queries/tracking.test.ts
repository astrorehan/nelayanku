import { describe, expect, it } from "vitest";
import { DEMO_START } from "../demo-clock";
import { createSeedDatabase } from "../seed";
import {
  materialExample,
  parseTrackingCode,
  publicBatchTrace,
  publicMaterialTrace,
  traceExamples,
  traceTimeline,
} from "./tracking";

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

describe("trace timeline and examples", () => {
  const trace = (code: string) => publicBatchTrace(db, code, DEMO_START)!;

  it("shows a shipment on the road as waiting for the buyer", () => {
    const steps = traceTimeline(trace("CKL-B-0511"));
    expect(steps.map((step) => step.state)).toEqual([
      "done",
      "done",
      "done",
      "done",
      "current",
    ]);
    expect(steps[4].label).toBe("Diterima");
  });

  it("marks a rejected shipment as failed at the last step", () => {
    const steps = traceTimeline(trace("TGK-A-0311-R"));
    expect(steps[4]).toMatchObject({ label: "Ditolak", state: "failed" });
    expect(trace("TGK-A-0311-R").receipt).toEqual({
      decision: "reject",
      acceptedKg: 0,
    });
  });

  it("labels partial receipt and keeps the receiver's reason private", () => {
    const partial = trace("TGK-A-1410");
    expect(traceTimeline(partial)[4]).toMatchObject({
      label: "Diterima sebagian",
      state: "done",
    });
    const rejected = JSON.stringify(trace("TGK-A-0311-R"));
    expect(rejected).not.toContain("Insang kusam");
    expect(rejected).not.toContain("Peti terasa hangat");
    expect(rejected).not.toContain("recheckScore");
  });

  it("keeps a filling shipment at the full step", () => {
    const steps = traceTimeline(trace("TGK-A-0511"));
    expect(steps[2]).toMatchObject({ state: "current" });
    expect(steps[2].detail).toContain("dari 40 kg");
  });

  it("measures the cold chain until receipt when one exists", () => {
    expect(trace("TGK-A-0411").cold?.measuredAtReceipt).toBe(true);
    const moving = trace("CKL-B-0511");
    expect(moving.cold?.measuredAtReceipt).toBe(false);
    expect(moving.cold!.elapsedMinutes).toBeGreaterThanOrEqual(0);
  });

  it("derives one example per outcome from the data", () => {
    const examples = traceExamples(db, DEMO_START);
    expect(examples.map((item) => item.outcome)).toEqual([
      "in_transit",
      "received",
      "partial",
      "rejected",
    ]);
    expect(examples.find((item) => item.outcome === "rejected")!.code).toBe(
      "TGK-A-0311-R",
    );
  });

  it("points the material card at a material that a product really uses", () => {
    const example = materialExample(db)!;
    expect(db.products.some((item) => item.materialId === example.id)).toBe(
      true,
    );
    const material = publicMaterialTrace(db, example.id)!;
    expect(material.parameters.eye).toBeGreaterThan(0);
    expect(JSON.stringify(material)).not.toContain("fisherId");
  });

  it("drops an example whose caption would no longer be true", () => {
    const changed = structuredClone(db);
    changed.batches.find((item) => item.code === "CKL-B-0511")!.status =
      "cancelled";
    const examples = traceExamples(changed, DEMO_START);
    expect(examples.some((item) => item.outcome === "in_transit")).toBe(false);
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
