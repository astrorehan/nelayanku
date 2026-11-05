import type { OdorOption, TextureOption } from "@/domain/freshness-score";
import type { Grade } from "@/domain/grade";
import type { BuyerKind } from "@/domain/pricing";

export const GRADE_LABEL: Record<Grade, string> = { A: "Prima", B: "Segar", C: "Olahan", REJECT: "Tolak" };

export const GRADE_MEANING: Record<Grade, string> = {
  A: "Untuk pesanan dapur dan restoran",
  B: "Untuk pesanan atau TPI",
  C: "Jadi bahan olahan",
  REJECT: "Bukan untuk dimakan",
};

export const GRADE_SPOKEN: Record<Grade, string> = { A: "grade A", B: "grade B", C: "grade C", REJECT: "tolak" };

export const ODOR_LABEL: Record<OdorOption, { title: string; hint: string }> = {
  sea_fresh: { title: "Segar", hint: "khas laut" },
  neutral: { title: "Netral", hint: "tidak tajam" },
  sour: { title: "Agak asam", hint: "amis kuat" },
  rotten: { title: "Busuk", hint: "menyengat" },
};

export const TEXTURE_LABEL: Record<TextureOption, { title: string; hint: string }> = {
  firm: { title: "Padat", hint: "cepat kembali" },
  slightly_soft: { title: "Agak lunak", hint: "lambat kembali" },
  soft: { title: "Lunak", hint: "berbekas" },
  very_soft: { title: "Sangat lunak", hint: "hancur" },
};

export const BUYER_KIND_LABEL: Record<BuyerKind, string> = {
  sppg: "Dapur SPPG",
  restaurant: "Restoran",
  hotel: "Hotel",
  catering: "Katering",
};
