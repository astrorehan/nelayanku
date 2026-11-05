import { describe, expect, it } from "vitest";
import { checkLabelCompliance, findForbiddenClaims, type LabelDraft } from "./label-compliance";

const completeDraft: LabelDraft = {
  productName: "Ikan Asin Tongkol",
  ingredients: ["ikan tongkol", "garam"],
  netWeightGrams: 250,
  producerName: "Bu Yanti",
  producerAddress: "Sumber Jaya, Kota Bengkulu",
  productionCode: "SJ-0511",
  productionDate: "2026-11-05",
  bestBefore: "2027-02-05",
  pirtNumber: "P-IRT No. 2061771010001-26",
  halalCertificateNumber: "",
  marketingText: "Ikan asin tongkol dari tangkapan nelayan Pulau Baai, dijemur matahari.",
};

describe("checkLabelCompliance", () => {
  it("is ready to print when every mandatory item is filled", () => {
    expect(checkLabelCompliance(completeDraft).readyToPrint).toBe(true);
  });

  it("leaves the P-IRT number to the owner and flags it when missing", () => {
    const result = checkLabelCompliance({ ...completeDraft, pirtNumber: "" });
    const pirt = result.checks.find((check) => check.requirement === "pirt_number");
    expect(pirt).toMatchObject({ satisfied: false, filler: "owner_only", formatProblem: false });
    expect(result.readyToPrint).toBe(false);
  });

  it("flags a P-IRT number that does not have 15 digits", () => {
    const result = checkLabelCompliance({ ...completeDraft, pirtNumber: "P-IRT No. 12345" });
    const pirt = result.checks.find((check) => check.requirement === "pirt_number");
    expect(pirt).toMatchObject({ satisfied: false, formatProblem: true });
  });

  it("requires both producer name and address", () => {
    const result = checkLabelCompliance({ ...completeDraft, producerAddress: " " });
    expect(result.checks.find((check) => check.requirement === "producer")?.satisfied).toBe(false);
  });
});

describe("findForbiddenClaims", () => {
  it("catches cure and health claims", () => {
    expect(findForbiddenClaims({ marketingText: "Ampuh menyembuhkan maag", halalCertificateNumber: "" })).toContain(
      "cure_claim",
    );
    expect(
      findForbiddenClaims({ marketingText: "Bisa meningkatkan imun anak", halalCertificateNumber: "" }),
    ).toContain("health_claim");
  });

  it("allows a halal claim only with a certificate number", () => {
    expect(findForbiddenClaims({ marketingText: "Produk halal", halalCertificateNumber: "" })).toEqual([
      "halal_without_certificate",
    ]);
    expect(findForbiddenClaims({ marketingText: "Produk halal", halalCertificateNumber: "ID12345" })).toEqual([]);
  });
});

it("blocks impossible or reversed shelf-life dates", () => {
  for (const dates of [{ productionDate: "2026-02-30" }, { bestBefore: "2026-01-01" }, { bestBefore: "not-a-date" }]) {
    expect(checkLabelCompliance({ ...completeDraft, ...dates }).readyToPrint).toBe(false);
  }
});

it("checks product names for unlicensed claims as well as marketing text", () => {
  const result = checkLabelCompliance({ ...completeDraft, productName: "Ikan Asin Halal", halalCertificateNumber: "" });
  expect(result.forbiddenClaims).toContain("halal_without_certificate");
  expect(result.readyToPrint).toBe(false);
});
