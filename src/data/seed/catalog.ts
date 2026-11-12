import type { Buyer, Fisher, FishSpecies, Kub, Producer, SpeciesId } from "../types";

export const KUB: Kub = {
  id: "kub-sumber-jaya",
  name: "KUB Sumber Jaya",
  village: "Sumber Jaya",
  district: "Kampung Melayu",
  regency: "Kota Bengkulu",
  port: "PPN Pulau Baai",
  legalForm: "Koperasi",
  operatorName: "Bu Sari",
};

export const SPECIES: FishSpecies[] = [
  {
    id: "tongkol",
    name: "Tongkol",
    latinName: "Euthynnus affinis",
    histamineRisk: true,
    freshnessWindow: { icedHours: 8, unicedHours: 3 },
  },
  {
    id: "cakalang",
    name: "Cakalang",
    latinName: "Katsuwonus pelamis",
    histamineRisk: true,
    freshnessWindow: { icedHours: 8, unicedHours: 3 },
  },
  {
    id: "kembung",
    name: "Kembung",
    latinName: "Rastrelliger kanagurta",
    histamineRisk: true,
    freshnessWindow: { icedHours: 10, unicedHours: 4 },
  },
];

const fisher = (
  memberNumber: number,
  name: string,
  initials: string,
  boatGrossTonnage: number,
  usualSpeciesId: SpeciesId,
): Fisher => ({
  id: `nelayan-${name.toLowerCase()}`,
  memberNumber,
  name,
  initials,
  boatGrossTonnage,
  usualSpeciesId,
  whatsapp: `0812-xxxx-${String(memberNumber).padStart(4, "0")}`,
});

export const FISHERS: Fisher[] = [
  fisher(1, "Darman", "DM", 3, "tongkol"),
  fisher(2, "Rusdi", "RS", 2, "tongkol"),
  fisher(3, "Syahril", "SY", 5, "kembung"),
  fisher(4, "Joni", "JN", 3, "tongkol"),
  fisher(5, "Edi", "ED", 2, "cakalang"),
  fisher(6, "Herman", "HR", 4, "tongkol"),
  fisher(7, "Iwan", "IW", 3, "tongkol"),
  fisher(8, "Yusuf", "YS", 2, "cakalang"),
  fisher(9, "Zainal", "ZN", 3, "tongkol"),
  fisher(10, "Anton", "AN", 5, "cakalang"),
  fisher(11, "Bujang", "BJ", 2, "kembung"),
  fisher(12, "Samsul", "SM", 3, "kembung"),
];

export const fisherIdByName = (name: string) => `nelayan-${name.toLowerCase()}`;

export const SPPG_BUYER_ID = "pembeli-sppg-kampung-melayu";
export const RESTAURANT_BUYER_ID = "pembeli-rm-pondok-laut";

export const BUYERS: Buyer[] = [
  {
    id: SPPG_BUYER_ID,
    kind: "sppg",
    name: "Dapur SPPG Kampung Melayu",
    contactName: "Pak Hendra",
    address: "Jl. Sumber Jaya No. 12, Kampung Melayu",
    district: "Kampung Melayu",
  },
  {
    id: RESTAURANT_BUYER_ID,
    kind: "restaurant",
    name: "RM Pondok Laut",
    contactName: "Bu Nur",
    address: "Jl. Pariwisata, Pantai Panjang",
    district: "Ratu Agung",
  },
];

export const PRODUCER_ID = "umkm-bu-yanti";

export const PRODUCERS: Producer[] = [
  { id: PRODUCER_ID, name: "Bu Yanti", address: "Sumber Jaya, Kampung Melayu, Kota Bengkulu" },
];

export const TOKE_NAME = "Pak Rusli";
export const COOPERATIVE_LENDER_NAME = "Koperasi Sumber Jaya";
