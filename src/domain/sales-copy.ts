import type { ProductCaptions } from "@/data/types";
import { formatNumber, formatRupiah } from "@/lib/format";
import { findForbiddenClaims } from "./label-compliance";

export interface SalesCopyInput {
  name: string;
  brand: string;
  grams: number;
  price: number;
  ingredients: string[];
  origin: string | null;
  ownerNote: string;
}

export const CAPTION_LIMITS: Record<keyof ProductCaptions, number> = {
  whatsappStatus: 300,
  marketplace: 1000,
  instagram: 700,
};

const MIN_CAPTION_LENGTH = 20;

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const cleaned = value.replace(CONTROL_CHARACTERS, "").trim();
  return cleaned.length <= maxLength ? cleaned : null;
}

function wholeNumberIn(value: unknown, min: number, max: number): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? value
    : null;
}

export function parseSalesCopyInput(body: unknown): SalesCopyInput | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const name = cleanText(raw.name, 80);
  const brand = cleanText(raw.brand ?? "", 60);
  const grams = wholeNumberIn(raw.grams, 1, 100_000);
  const price = wholeNumberIn(raw.price, 1, 10_000_000);
  const ownerNote = cleanText(raw.ownerNote ?? "", 500);
  const origin = raw.origin === null || raw.origin === undefined ? null : cleanText(raw.origin, 120);
  if (!Array.isArray(raw.ingredients) || raw.ingredients.length > 15) return null;
  const ingredients = raw.ingredients.map((item) => cleanText(item, 60));
  if (
    !name ||
    brand === null ||
    grams === null ||
    price === null ||
    ownerNote === null ||
    (raw.origin != null && !origin) ||
    ingredients.some((item) => item === null)
  ) {
    return null;
  }
  const filledIngredients = (ingredients as string[]).filter(Boolean);
  if (filledIngredients.length === 0) return null;
  return { name, brand, grams, price, ingredients: filledIngredients, origin: origin || null, ownerNote };
}

export type SalesCopyProblem =
  | "missing_channel"
  | "too_short"
  | "too_long"
  | "forbidden_claim"
  | "unsupported_fact"
  | "wrong_price";

// Facts the owner never supplies to the model, so any mention is invented.
const UNSUPPORTED_FACT_PATTERNS = [
  /\bp-?irt\b/i,
  /\bbpom\b/i,
  /\bhalal\b/i,
  /\bsni\b/i,
  /\btahan\s+\d+\s*(hari|minggu|bulan|tahun)\b/i,
  /\btanpa\s+(bahan\s+)?pengawet\b/i,
  /\btanpa\s+msg\b/i,
  /\borganik\b/i,
  /\b(diskon|promo|gratis ongkir)\b/i,
];

const RUPIAH_AMOUNT = /Rp\s?([\d.]+)/gi;

function rupiahAmounts(text: string): number[] {
  return [...text.matchAll(RUPIAH_AMOUNT)].map((match) => Number(match[1].replace(/\./g, "")));
}

export function readCaptions(value: unknown): ProductCaptions | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const keys = Object.keys(CAPTION_LIMITS) as Array<keyof ProductCaptions>;
  if (!keys.every((key) => typeof raw[key] === "string")) return null;
  return {
    whatsappStatus: (raw.whatsappStatus as string).trim(),
    marketplace: (raw.marketplace as string).trim(),
    instagram: (raw.instagram as string).trim(),
  };
}

export function checkGeneratedCopy(input: SalesCopyInput, captions: ProductCaptions): SalesCopyProblem[] {
  const problems = new Set<SalesCopyProblem>();
  for (const key of Object.keys(CAPTION_LIMITS) as Array<keyof ProductCaptions>) {
    const text = captions[key];
    if (!text) {
      problems.add("missing_channel");
      continue;
    }
    if (text.length < MIN_CAPTION_LENGTH) problems.add("too_short");
    if (text.length > CAPTION_LIMITS[key]) problems.add("too_long");
    if (findForbiddenClaims({ marketingText: text, halalCertificateNumber: "" }).length > 0) {
      problems.add("forbidden_claim");
    }
    if (UNSUPPORTED_FACT_PATTERNS.some((pattern) => pattern.test(text))) problems.add("unsupported_fact");
    if (rupiahAmounts(text).some((amount) => amount !== Math.round(input.price))) problems.add("wrong_price");
  }
  return [...problems];
}

export function salesCopyFacts(input: SalesCopyInput) {
  return {
    nama_produk: input.name,
    merek: input.brand || null,
    berat_bersih: `${formatNumber(input.grams)} g`,
    harga_per_kemasan: formatRupiah(input.price),
    komposisi: input.ingredients,
    asal_bahan: input.origin,
    catatan_pemilik: input.ownerNote || null,
  };
}
