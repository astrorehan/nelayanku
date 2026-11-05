import type { Product } from "../types";
import { PRODUCER_ID, PRODUCERS } from "./catalog";

const producer = PRODUCERS[0];

export const SEED_PRODUCTS: Product[] = [
  {
    id: "produk-ikan-asin-tongkol",
    producerId: PRODUCER_ID,
    materialId: "bahan-darat-2026-10-29-darman",
    name: "Ikan Asin Tongkol",
    brand: "Asin Bu Yanti",
    spokenDescription: "Ikan asin tongkol, 250 gram, garam saja, tahan 3 bulan",
    run: {
      rawFishKg: 9,
      rawFishPricePerKg: 7150,
      yieldRatio: 0.45,
      packNetWeightGrams: 250,
      seasoningCost: 9000,
      fuelCost: 13500,
      laborCost: 22500,
      packagingCostPerPack: 1500,
    },
    marginRate: 0.3,
    label: {
      productName: "Ikan Asin Tongkol",
      ingredients: ["ikan tongkol", "garam"],
      netWeightGrams: 250,
      producerName: producer.name,
      producerAddress: producer.address,
      productionCode: "SJ-2910",
      productionDate: "2026-10-30",
      bestBefore: "2027-01-30",
      pirtNumber: "P-IRT No. 2061771010001-26",
      halalCertificateNumber: "",
      marketingText: "Ikan asin tongkol dari tangkapan nelayan Pulau Baai, dijemur matahari, cuma pakai garam.",
    },
    captions: {
      whatsappStatus:
        "Ikan asin tongkol dari tangkapan nelayan Pulau Baai. Dijemur matahari, cuma pakai garam. 250 g Rp11.000. Pesan lewat WA ya.",
      marketplace:
        "Ikan Asin Tongkol 250 g dari Asin Bu Yanti. Dibuat dari tongkol tangkapan nelayan KUB Sumber Jaya, Pulau Baai, Bengkulu. Bahan: ikan tongkol dan garam. Dijemur di bawah matahari. Simpan di tempat kering dan sejuk. Baik digunakan sebelum 3 bulan sejak tanggal produksi.",
      instagram:
        "Dari laut Pulau Baai ke dapurmu. Tongkol tangkapan nelayan kecil, dijemur matahari, cuma garam. Asin Bu Yanti, 250 g. #ikanasin #bengkulu #umkmbengkulu",
    },
  },
  {
    id: "produk-kerupuk-kembung",
    producerId: PRODUCER_ID,
    materialId: null,
    name: "Kerupuk Ikan Kembung",
    brand: "Asin Bu Yanti",
    spokenDescription: "Kerupuk ikan kembung, 200 gram, tepung tapioka, bawang putih, garam, tahan 2 bulan",
    run: {
      rawFishKg: 6,
      rawFishPricePerKg: 11000,
      yieldRatio: 0.9,
      packNetWeightGrams: 200,
      seasoningCost: 38000,
      fuelCost: 15000,
      laborCost: 30000,
      packagingCostPerPack: 1200,
    },
    marginRate: 0.35,
    label: {
      productName: "Kerupuk Ikan Kembung",
      ingredients: ["ikan kembung", "tepung tapioka", "bawang putih", "garam"],
      netWeightGrams: 200,
      producerName: producer.name,
      producerAddress: producer.address,
      productionCode: "SJ-0411",
      productionDate: "2026-11-04",
      bestBefore: "2027-01-04",
      pirtNumber: "",
      halalCertificateNumber: "",
      marketingText: "Kerupuk ikan kembung renyah dari tangkapan nelayan Pulau Baai.",
    },
    captions: {
      whatsappStatus: "Kerupuk ikan kembung renyah, dari tangkapan nelayan Pulau Baai. 200 g. Pesan lewat WA ya.",
      marketplace:
        "Kerupuk Ikan Kembung 200 g dari Asin Bu Yanti. Dibuat dari kembung tangkapan nelayan KUB Sumber Jaya, Bengkulu. Bahan: ikan kembung, tepung tapioka, bawang putih, garam. Goreng sebelum disajikan.",
      instagram:
        "Kerupuk ikan kembung dari Pulau Baai. Digoreng, renyah, cocok untuk teman makan. #kerupukikan #bengkulu #umkmbengkulu",
    },
  },
];
