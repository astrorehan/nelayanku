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

export const EYE_CLASS_LABEL = {
  very_fresh: { title: "Sangat segar", reason: "Mata cembung, kornea jernih, pupil hitam pekat" },
  fresh: { title: "Segar", reason: "Mata rata, kornea mulai agak keruh" },
  not_fresh: { title: "Tidak segar", reason: "Mata cekung, kornea keruh, pupil kelabu" },
} as const;

export const EYE_MANUAL_LABEL = {
  bulging_clear: { title: "Cembung, jernih", hint: "pupil hitam pekat" },
  flat_slightly_cloudy: { title: "Rata, agak keruh", hint: "pupil masih gelap" },
  sunken_cloudy: { title: "Cekung, keruh", hint: "pupil kelabu" },
} as const;

export const GILL_MANUAL_LABEL = {
  bright_red: { title: "Merah cerah", hint: "lendir bening" },
  faded_red: { title: "Merah pudar", hint: "agak kecoklatan" },
  brown_grey: { title: "Coklat kelabu", hint: "lendir keruh" },
} as const;

export const QUALITY_PROBLEM_LABEL = {
  too_dark: "Foto terlalu gelap. Coba di tempat lebih terang atau nyalakan senter.",
  glare: "Foto silau. Miringkan sedikit HP agar pantulan cahaya hilang.",
  blurry: "Foto buram. Tahan HP lebih diam dan dekatkan ke mata ikan.",
} as const;
