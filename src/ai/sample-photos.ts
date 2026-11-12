import type { EyeProbabilities, GillProbabilities, OdorOption, TextureOption } from "@/domain/freshness-score";

export type EyeFreshnessClass = "very_fresh" | "fresh" | "not_fresh";

export function dominantEyeClass(probabilities: EyeProbabilities): { eyeClass: EyeFreshnessClass; share: number } {
  const entries: Array<[EyeFreshnessClass, number]> = [
    ["very_fresh", probabilities.veryFresh],
    ["fresh", probabilities.fresh],
    ["not_fresh", probabilities.notFresh],
  ];
  const total = entries.reduce((sum, [, value]) => sum + value, 0);
  const [eyeClass, value] = entries.reduce((best, entry) => (entry[1] > best[1] ? entry : best));
  return { eyeClass, share: total > 0 ? value / total : 0 };
}

export interface SamplePhotoSource {
  dataset: string;
  authors: string;
  license: string;
  licenseUrl: string;
  doi: string;
  originalFile: string;
  originalClass: string;
  changes: string;
}

export interface SamplePhoto {
  id: string;
  speciesName: string;
  speciesLatin: string;
  eyeImage: string;
  trueEyeClass: EyeFreshnessClass;
  gillImage: string | null;
  exampleHumanInputs: {
    gill: GillManualOption;
    odor: OdorOption;
    texture: TextureOption;
  };
  source: SamplePhotoSource;
}

export const GILL_MANUAL_OPTIONS = ["bright_red", "faded_red", "brown_grey"] as const;
export type GillManualOption = (typeof GILL_MANUAL_OPTIONS)[number];

export const GILL_MANUAL_PROBABILITIES: Record<GillManualOption, GillProbabilities> = {
  bright_red: { fresh: 1, notFresh: 0 },
  faded_red: { fresh: 0.5, notFresh: 0.5 },
  brown_grey: { fresh: 0, notFresh: 1 },
};

export const EYE_MANUAL_OPTIONS = ["bulging_clear", "flat_slightly_cloudy", "sunken_cloudy"] as const;
export type EyeManualOption = (typeof EYE_MANUAL_OPTIONS)[number];

export const EYE_MANUAL_PROBABILITIES: Record<EyeManualOption, EyeProbabilities> = {
  bulging_clear: { veryFresh: 1, fresh: 0, notFresh: 0 },
  flat_slightly_cloudy: { veryFresh: 0, fresh: 1, notFresh: 0 },
  sunken_cloudy: { veryFresh: 0, fresh: 0, notFresh: 1 },
};

const FFE = {
  dataset: "The Freshness of the Fish Eyes (FFE) Dataset",
  authors: "Prasetyo, Purbaningtyas, Adityo, Suciati, Fatichah (2022)",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  doi: "10.17632/xzyx7pbr3w.1",
  changes: "Dipotong persegi di tengah dan disimpan ulang sebagai JPEG.",
};

const sample = (
  id: string,
  trueEyeClass: EyeFreshnessClass,
  originalFile: string,
  originalClass: string,
  exampleHumanInputs: SamplePhoto["exampleHumanInputs"],
): SamplePhoto => ({
  id,
  speciesName: "Kembung",
  speciesLatin: "Rastrelliger faughni",
  eyeImage: `/samples/ffe/kembung-mata-${id}.jpg`,
  trueEyeClass,
  gillImage: null,
  exampleHumanInputs,
  source: { ...FFE, originalFile, originalClass },
});

export const SAMPLE_PHOTOS: SamplePhoto[] = [
  sample("sangat-segar-1", "very_fresh", "IMG_20191014_065738.jpg", "Rastrelliger Faughni - Highly Fresh", {
    gill: "bright_red",
    odor: "sea_fresh",
    texture: "slightly_soft",
  }),
  sample("sangat-segar-2", "very_fresh", "IMG_20191015_063633.jpg", "Rastrelliger Faughni - Highly Fresh", {
    gill: "bright_red",
    odor: "sea_fresh",
    texture: "firm",
  }),
  sample("segar-1", "fresh", "IMG_20191017_063813.jpg", "Rastrelliger Faughni - Fresh", {
    gill: "faded_red",
    odor: "neutral",
    texture: "slightly_soft",
  }),
  sample("segar-2", "fresh", "IMG_20191112_063810_2.jpg", "Rastrelliger Faughni - Fresh", {
    gill: "bright_red",
    odor: "neutral",
    texture: "firm",
  }),
  sample("tidak-segar-1", "not_fresh", "IMG_20191115_061135.jpg", "Rastrelliger Faughni - Not Fresh", {
    gill: "brown_grey",
    odor: "sour",
    texture: "soft",
  }),
  sample("tidak-segar-2", "not_fresh", "IMG_20191114_062011.jpg", "Rastrelliger Faughni - Not Fresh", {
    gill: "faded_red",
    odor: "sour",
    texture: "slightly_soft",
  }),
];

export function samplePhotoById(id: string): SamplePhoto | undefined {
  return SAMPLE_PHOTOS.find((photo) => photo.id === id);
}
