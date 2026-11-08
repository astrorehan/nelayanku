import { describe, expect, it } from "vitest";
import { checkGeneratedCopy, parseSalesCopyInput, salesCopyFacts, type SalesCopyInput } from "./sales-copy";

const input: SalesCopyInput = {
  name: "Ikan Asin Tongkol Pagi",
  brand: "Asin Bu Yanti",
  grams: 250,
  price: 11000,
  ingredients: ["ikan tongkol", "garam"],
  origin: "KUB Sumber Jaya, Pulau Baai",
  ownerNote: "Dijemur dua hari di halaman rumah.",
};

const goodCopy = {
  whatsappStatus: "Ikan Asin Tongkol Pagi 250 g, Rp11.000 per kemasan. Pesan lewat WhatsApp, ya.",
  marketplace:
    "Ikan Asin Tongkol Pagi dari Asin Bu Yanti, berat bersih 250 g. Komposisi: ikan tongkol dan garam. Ikan dari KUB Sumber Jaya, Pulau Baai, dijemur dua hari. Baca cara simpan dan tanggal pada label.",
  instagram: "Tongkol asin buatan rumah, dijemur dua hari 🐟 Rp 11.000 per kemasan. #ikanasin #bengkulu",
};

describe("parseSalesCopyInput", () => {
  it("accepts a complete product and drops empty ingredients", () => {
    expect(parseSalesCopyInput({ ...input, ingredients: ["ikan tongkol", " ", "garam"] })).toEqual(input);
  });

  it("rejects missing names, fractional prices, and oversized notes", () => {
    expect(parseSalesCopyInput({ ...input, name: "  " })).toBeNull();
    expect(parseSalesCopyInput({ ...input, price: 110.5 })).toBeNull();
    expect(parseSalesCopyInput({ ...input, ownerNote: "a".repeat(501) })).toBeNull();
    expect(parseSalesCopyInput({ ...input, ingredients: [] })).toBeNull();
    expect(parseSalesCopyInput("ikan")).toBeNull();
  });

  it("keeps a missing origin as null", () => {
    expect(parseSalesCopyInput({ ...input, origin: null })?.origin).toBeNull();
  });
});

describe("checkGeneratedCopy", () => {
  it("passes copy that only repeats supplied facts", () => {
    expect(checkGeneratedCopy(input, goodCopy)).toEqual([]);
  });

  it("rejects invented permits, halal, shelf life, and health claims", () => {
    for (const invented of [
      "Sudah P-IRT dan aman.",
      "Dijamin halal.",
      "Tahan 3 bulan di lemari.",
      "Tanpa pengawet sama sekali.",
      "Bisa menyembuhkan pegal.",
    ]) {
      const problems = checkGeneratedCopy(input, { ...goodCopy, instagram: `${goodCopy.instagram} ${invented}` });
      expect(problems.length, invented).toBeGreaterThan(0);
    }
  });

  it("rejects any rupiah amount other than the product price", () => {
    expect(
      checkGeneratedCopy(input, { ...goodCopy, whatsappStatus: "Ikan Asin Tongkol Pagi, dari Rp15.000 jadi Rp11.000!" }),
    ).toContain("wrong_price");
  });

  it("rejects empty and overlong channels", () => {
    expect(checkGeneratedCopy(input, { ...goodCopy, marketplace: "" })).toContain("missing_channel");
    expect(checkGeneratedCopy(input, { ...goodCopy, whatsappStatus: "a".repeat(301) })).toContain("too_long");
  });
});

it("formats the facts sent to the model the way the label shows them", () => {
  expect(salesCopyFacts(input)).toMatchObject({ berat_bersih: "250 g", harga_per_kemasan: "Rp11.000" });
});
