import { GRADE_PRICE_MULTIPLIER, roundToNearest } from "@/domain/pricing";
import type { OdorOption, TextureOption } from "@/domain/freshness-score";
import { DEMO_DATE, demoTime, demoTimestamp } from "../demo-clock";
import type { Batch, BatchItem, Grading, Landing, LedgerEntry, Order, ProcessingMaterial, ReferencePrice, SpeciesId } from "../types";
import { BUYERS, fisherIdByName, RESTAURANT_BUYER_ID, SPPG_BUYER_ID, TOKE_NAME } from "./catalog";
import { batchCode, buildGrading, portPriceOn } from "./history";

export const TODAY_TONGKOL_BATCH_ID = `batch-${DEMO_DATE}-tongkol`;
export const TODAY_CAKALANG_BATCH_ID = `batch-${DEMO_DATE}-cakalang`;
export const TODAY_KEMBUNG_BATCH_ID = `batch-${DEMO_DATE}-kembung`;

interface TodayLanding {
  fisher: string;
  speciesId: SpeciesId;
  weightKg: number;
  time: string;
  iced: boolean;
  quality: { eye: number; gill: number; odor: OdorOption; texture: TextureOption } | null;
  batchId: string | null;
}

const TODAY_LANDINGS: TodayLanding[] = [
  { fisher: "Zainal", speciesId: "tongkol", weightKg: 9, time: "03:31", iced: false, quality: null, batchId: null },
  {
    fisher: "Anton",
    speciesId: "cakalang",
    weightKg: 16,
    time: "04:32",
    iced: true,
    quality: { eye: 8, gill: 7.8, odor: "neutral", texture: "slightly_soft" },
    batchId: TODAY_CAKALANG_BATCH_ID,
  },
  {
    fisher: "Yusuf",
    speciesId: "cakalang",
    weightKg: 14,
    time: "04:40",
    iced: true,
    quality: { eye: 8.6, gill: 8.3, odor: "sea_fresh", texture: "firm" },
    batchId: TODAY_CAKALANG_BATCH_ID,
  },
  {
    fisher: "Iwan",
    speciesId: "tongkol",
    weightKg: 12,
    time: "04:58",
    iced: false,
    quality: { eye: 6.4, gill: 6, odor: "sour", texture: "soft" },
    batchId: null,
  },
  {
    fisher: "Herman",
    speciesId: "tongkol",
    weightKg: 8,
    time: "05:05",
    iced: true,
    quality: { eye: 8.8, gill: 8.4, odor: "sea_fresh", texture: "firm" },
    batchId: TODAY_TONGKOL_BATCH_ID,
  },
  {
    fisher: "Syahril",
    speciesId: "kembung",
    weightKg: 10,
    time: "05:10",
    iced: true,
    quality: { eye: 7.6, gill: 7.2, odor: "neutral", texture: "slightly_soft" },
    batchId: TODAY_KEMBUNG_BATCH_ID,
  },
  {
    fisher: "Joni",
    speciesId: "tongkol",
    weightKg: 14,
    time: "05:22",
    iced: true,
    quality: { eye: 8.5, gill: 8.2, odor: "sea_fresh", texture: "slightly_soft" },
    batchId: TODAY_TONGKOL_BATCH_ID,
  },
];

export interface TodayRecords {
  landings: Landing[];
  gradings: Grading[];
  orders: Order[];
  batches: Batch[];
  batchItems: BatchItem[];
  ledger: LedgerEntry[];
  materials: ProcessingMaterial[];
}

const addressOf = (buyerId: string) => BUYERS.find((buyer) => buyer.id === buyerId)!.address;

export function createTodayScenario(prices: readonly ReferencePrice[]): TodayRecords {
  const landings: Landing[] = [];
  const gradings: Grading[] = [];
  const batchItems: BatchItem[] = [];
  const materials: ProcessingMaterial[] = [];

  for (const entry of TODAY_LANDINGS) {
    const landedAt = demoTime(DEMO_DATE, entry.time);
    const landing: Landing = {
      id: `darat-${DEMO_DATE}-${entry.fisher.toLowerCase()}`,
      fisherId: fisherIdByName(entry.fisher),
      speciesId: entry.speciesId,
      weightKg: entry.weightKg,
      landedAt,
      iced: entry.iced,
      destination: entry.batchId ? "batch" : null,
    };
    if (entry.quality) {
      const grading = buildGrading(landing, entry.quality, demoTimestamp(new Date(landedAt).getTime() + 6 * 60_000));
      gradings.push(grading);
      if (grading.grade === "C") {
        landing.destination = "processing";
        materials.push({
          id: `bahan-${landing.id}`,
          landingId: landing.id,
          kg: landing.weightKg,
          pricePerKg: roundToNearest(portPriceOn(prices, landing.speciesId, DEMO_DATE) * GRADE_PRICE_MULTIPLIER.C, 50),
          takenByProducerId: null,
          takenAt: null,
        });
      }
    }
    if (entry.batchId) {
      batchItems.push({ batchId: entry.batchId, landingId: landing.id, kg: landing.weightKg });
    }
    landings.push(landing);
  }

  const placedAt = demoTime("2026-11-04", "15:10");
  const orders: Order[] = [
    {
      id: `pesanan-${DEMO_DATE}-cakalang`,
      buyerId: SPPG_BUYER_ID,
      speciesId: "cakalang",
      minimumGrade: "B",
      targetKg: 30,
      pricePerKg: 22000,
      deliverAt: demoTime(DEMO_DATE, "06:30"),
      address: addressOf(SPPG_BUYER_ID),
      downPaymentRate: 0.3,
      placedAt,
      status: "filling",
    },
    {
      id: `pesanan-${DEMO_DATE}-tongkol`,
      buyerId: SPPG_BUYER_ID,
      speciesId: "tongkol",
      minimumGrade: "A",
      targetKg: 40,
      pricePerKg: 20000,
      deliverAt: demoTime(DEMO_DATE, "08:00"),
      address: addressOf(SPPG_BUYER_ID),
      downPaymentRate: 0.3,
      placedAt: demoTime("2026-11-04", "15:42"),
      status: "filling",
    },
    {
      id: `pesanan-${DEMO_DATE}-kembung`,
      buyerId: RESTAURANT_BUYER_ID,
      speciesId: "kembung",
      minimumGrade: "B",
      targetKg: 25,
      pricePerKg: 26000,
      deliverAt: demoTime(DEMO_DATE, "09:00"),
      address: addressOf(RESTAURANT_BUYER_ID),
      downPaymentRate: 0.3,
      placedAt: demoTime("2026-11-04", "17:05"),
      status: "filling",
    },
  ];

  const batches: Batch[] = [
    {
      id: TODAY_CAKALANG_BATCH_ID,
      code: batchCode("cakalang", "B", DEMO_DATE),
      orderId: orders[0].id,
      status: "in_transit",
      fillDeadline: demoTime(DEMO_DATE, "05:30"),
      labelledAt: demoTime(DEMO_DATE, "05:24"),
      departedAt: demoTime(DEMO_DATE, "05:35"),
      checklist: { enoughIce: true, closedContainer: true, labelAttached: true, courier: "Pak Udin" },
    },
    {
      id: TODAY_TONGKOL_BATCH_ID,
      code: batchCode("tongkol", "A", DEMO_DATE),
      orderId: orders[1].id,
      status: "filling",
      fillDeadline: demoTime(DEMO_DATE, "07:30"),
      labelledAt: null,
      departedAt: null,
      checklist: null,
    },
    {
      id: TODAY_KEMBUNG_BATCH_ID,
      code: batchCode("kembung", "B", DEMO_DATE),
      orderId: orders[2].id,
      status: "filling",
      fillDeadline: demoTime(DEMO_DATE, "08:30"),
      labelledAt: null,
      departedAt: null,
      checklist: null,
    },
  ];

  const ledger: LedgerEntry[] = [
    {
      id: `kas-${TODAY_TONGKOL_BATCH_ID}-${fisherIdByName("Darman")}-cicilan`,
      fisherId: fisherIdByName("Darman"),
      kind: "installment",
      amount: 50000,
      counterparty: TOKE_NAME,
      note: "Cicilan dari uang pesanan hari ini",
      date: demoTime(DEMO_DATE, "05:00"),
      batchId: TODAY_TONGKOL_BATCH_ID,
      approval: "pending",
    },
  ];

  return { landings, gradings, orders, batches, batchItems, ledger, materials };
}
