import { expect, it } from "vitest";
import { productCopy } from "./product-copy";

it("uses only supplied product facts without inventing an origin, permit, or shelf life", () => {
  const copy = productCopy({ name: "Ikan asin tongkol", brand: "Asin Bu Yanti", grams: 250, price: 11000, ingredients: ["ikan tongkol", "garam"], origin: null });
  expect(copy.marketplace).toContain("250 g");
  expect(copy.whatsappStatus).toContain("Rp11.000");
  for (const text of Object.values(copy)) {
    for (const invented of ["Pulau Baai", "halal", "P-IRT", "3 bulan"]) expect(text).not.toContain(invented);
  }
});
