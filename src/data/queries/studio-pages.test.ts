import { describe, expect, it } from "vitest";
import { DEMO_START } from "../demo-clock";
import { DEMO_PRODUCER_ID } from "../demo-identities";
import { createSeedDatabase } from "../seed";
import {
  availableMaterialCards,
  costBreakdown,
  findProducerProduct,
  PERMIT_STEPS,
  producerProducts,
  productOrigin,
  studioStats,
} from "./studio-pages";

describe("studio pages queries", () => {
  const db = createSeedDatabase();
  const products = producerProducts(db, DEMO_PRODUCER_ID);

  it("summarises seeded products with price above cost", () => {
    expect(products.length).toBeGreaterThanOrEqual(2);
    for (const item of products) {
      expect(item.cost).not.toBeNull();
      expect(item.price!).toBeGreaterThan(item.cost!.costPerPack);
      expect(item.marginPerPack!).toBeGreaterThan(0);
    }
  });

  it("flags the product without P-IRT as not ready with a missing count", () => {
    const kerupuk = products.find((item) => item.product.id === "produk-kerupuk-kembung")!;
    expect(kerupuk.ready).toBe(false);
    expect(kerupuk.missingCount).toBeGreaterThan(0);
  });

  it("counts stats", () => {
    const stats = studioStats(products);
    expect(stats.productCount).toBe(products.length);
    expect(stats.readyCount + stats.notReadyCount).toBe(products.length);
    expect(stats.rescuedKg).toBeGreaterThan(0);
  });

  it("splits cost into shares that add up to one", () => {
    const segments = costBreakdown(products[0].product);
    expect(segments).toHaveLength(5);
    expect(segments.reduce((sum, item) => sum + item.share, 0)).toBeCloseTo(1, 5);
  });

  it("returns null for unknown or foreign products", () => {
    expect(findProducerProduct(db, DEMO_PRODUCER_ID, "tidak-ada")).toBeNull();
    expect(findProducerProduct(db, "producer-lain", products[0].product.id)).toBeNull();
  });

  it("resolves material origin when linked", () => {
    const linked = products.find((item) => item.product.materialId)!;
    expect(productOrigin(db, linked.product)?.material.id).toBe(linked.product.materialId);
    expect(productOrigin(db, products.find((item) => !item.product.materialId)!.product)).toBeNull();
  });

  it("lists grade C material cards", () => {
    const cards = availableMaterialCards(db, DEMO_PRODUCER_ID, DEMO_START);
    for (const card of cards) {
      expect(card.kg).toBeGreaterThan(0);
      expect(card.hoursSinceLanding).toBeGreaterThanOrEqual(0);
    }
  });

  it("describes three permit steps with official links", () => {
    expect(PERMIT_STEPS.map((step) => step.id)).toEqual(["nib", "spp-irt", "halal"]);
    for (const step of PERMIT_STEPS) expect(step.url.startsWith("https://")).toBe(true);
  });
});
