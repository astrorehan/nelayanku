import { describe, expect, it } from "vitest";
import { takeMaterial, saveProduct, type CommandContext } from "../commands";
import { DEMO_START } from "../demo-clock";
import { DEMO_PRODUCER_ID } from "../demo-identities";
import { createSeedDatabase } from "../seed";
import { newProduct, processingMaterials } from "./studio";

const ctx: CommandContext = {
  now: DEMO_START,
  actor: "Bu Yanti",
  newId: (prefix) => `${prefix}-uji`,
};

describe("processing materials", () => {
  it("reserves a grade-C landing for one product and prevents double use", () => {
    const db = createSeedDatabase();
    const available = processingMaterials(db, DEMO_PRODUCER_ID);
    expect(available.length).toBeGreaterThan(0);
    const { material } = available[0];
    const reserved = takeMaterial(
      db,
      { materialId: material.id, producerId: DEMO_PRODUCER_ID },
      ctx,
    ).db;
    const product = {
      ...newProduct(db, DEMO_PRODUCER_ID, DEMO_START, "produk-uji"),
      name: "Olahan tongkol",
      materialId: material.id,
    };
    product.run.rawFishKg = material.kg;
    const saved = saveProduct(reserved, product, ctx).db;
    expect(
      processingMaterials(saved, DEMO_PRODUCER_ID).some(
        (item) => item.material.id === material.id,
      ),
    ).toBe(false);
    expect(
      processingMaterials(saved, DEMO_PRODUCER_ID, product.id).some(
        (item) => item.material.id === material.id,
      ),
    ).toBe(true);
    expect(() =>
      saveProduct(saved, { ...product, id: "produk-kedua" }, ctx),
    ).toThrow();
  });

  it("rejects unreserved material, rejected fish, and more kg than reserved", () => {
    const db = createSeedDatabase();
    const { material } = processingMaterials(db, DEMO_PRODUCER_ID)[0];
    const product = {
      ...newProduct(db, DEMO_PRODUCER_ID, DEMO_START, "produk-uji"),
      name: "Ikan asin",
      materialId: material.id,
    };
    expect(() => saveProduct(db, product, ctx)).toThrow();
    const reserved = takeMaterial(
      db,
      { materialId: material.id, producerId: DEMO_PRODUCER_ID },
      ctx,
    ).db;
    expect(() =>
      saveProduct(
        reserved,
        { ...product, run: { ...product.run, rawFishKg: material.kg + 1 } },
        ctx,
      ),
    ).toThrow();
    const changed = structuredClone(db);
    changed.gradings.find(
      (item) => item.landingId === material.landingId,
    )!.grade = "REJECT";
    expect(
      processingMaterials(changed, DEMO_PRODUCER_ID).some(
        (item) => item.material.id === material.id,
      ),
    ).toBe(false);
    expect(() =>
      takeMaterial(
        changed,
        { materialId: material.id, producerId: DEMO_PRODUCER_ID },
        ctx,
      ),
    ).toThrow();
  });

  it("does not invent licenses, expiry dates, or claims for a new product", () => {
    const product = newProduct(
      createSeedDatabase(),
      DEMO_PRODUCER_ID,
      DEMO_START,
      "baru",
    );
    expect(product.label.pirtNumber).toBe("");
    expect(product.label.halalCertificateNumber).toBe("");
    expect(product.label.bestBefore).toBe("");
    expect(product.label.marketingText).toBe("");
  });
});
