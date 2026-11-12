import type { ProductCaptions } from "@/data/types";
import { formatNumber, formatRupiah } from "@/lib/format";

export function productCopy(input: {
  name: string;
  brand: string;
  grams: number;
  price: number;
  ingredients: string[];
  origin: string | null;
}): ProductCaptions {
  const name = input.name.trim();
  const summary = `${name}${input.brand.trim() ? ` dari ${input.brand.trim()}` : ""} · ${formatNumber(input.grams)} g`;
  const origin = input.origin ? ` Bahan ikan dari ${input.origin}.` : "";
  const ingredients = input.ingredients
    .filter((value) => value.trim())
    .join(", ");
  return {
    whatsappStatus: `${summary}, ${formatRupiah(input.price)}.${origin} Hubungi kami untuk pemesanan.`,
    marketplace: `${summary}.${origin}${ingredients ? ` Komposisi: ${ingredients}.` : ""} Harga ${formatRupiah(input.price)} per kemasan. Periksa informasi penyimpanan dan tanggal baik digunakan sebelum pada label.`,
    instagram: `${summary}.${origin} ${formatRupiah(input.price)} per kemasan. Pesan langsung kepada pengolah.`,
  };
}
