import { sppgIneligibilityReason } from "@/domain/cold-chain";
import {
  gradeFromParameters,
  ODOR_SCORE,
  roundToOneDecimal,
  TEXTURE_SCORE,
  type OdorOption,
  type TextureOption,
} from "@/domain/freshness-score";
import { isGradeAtLeast, type Grade } from "@/domain/grade";
import { GRADE_PRICE_MULTIPLIER, priceBreakdown, roundToNearest } from "@/domain/pricing";
import { splitRevenue } from "@/domain/revenue-share";
import { addDays, DEMO_DATE, demoTime, demoTimestamp, weekdayOf } from "../demo-clock";
import { buildGradingFromParameters } from "../grading-record";
import type {
  Batch,
  BatchItem,
  Buyer,
  Grading,
  Landing,
  LedgerEntry,
  Order,
  Payment,
  ProcessingMaterial,
  Receipt,
  ReferencePrice,
  SpeciesId,
} from "../types";
import {
  BUYERS,
  COOPERATIVE_LENDER_NAME,
  FISHERS,
  fisherIdByName,
  PRODUCER_ID,
  RESTAURANT_BUYER_ID,
  SPECIES,
  SPPG_BUYER_ID,
  TOKE_NAME,
} from "./catalog";
import { createSeededRandom, type SeededRandom } from "./random";

export const HISTORY_DAYS = 30;
export const SIMULATED_MODEL_VERSION = "kesegaran-simulasi-0.1";

const NO_FISHING_WEEKDAY = 5;
const STORM_DATES = new Set(["2026-10-20"]);
const LATE_PAYMENT_ORDER_DATE = "2026-10-22";
const PARTIAL_RECEIPT_ORDER_DATE = "2026-10-14";

export const SPECIES_CODE: Record<SpeciesId, string> = { tongkol: "TGK", cakalang: "CKL", kembung: "KMB" };

interface OrderPlan {
  buyerId: string;
  speciesId: SpeciesId;
  minimumGrade: Grade;
  targetKg: number;
  pricePerKg: number;
  deliverTime: string;
}

const SPPG_TONGKOL: OrderPlan = {
  buyerId: SPPG_BUYER_ID,
  speciesId: "tongkol",
  minimumGrade: "A",
  targetKg: 40,
  pricePerKg: 20000,
  deliverTime: "08:00",
};
const SPPG_CAKALANG: OrderPlan = {
  buyerId: SPPG_BUYER_ID,
  speciesId: "cakalang",
  minimumGrade: "B",
  targetKg: 30,
  pricePerKg: 22000,
  deliverTime: "06:30",
};
const RESTAURANT_KEMBUNG: OrderPlan = {
  buyerId: RESTAURANT_BUYER_ID,
  speciesId: "kembung",
  minimumGrade: "B",
  targetKg: 25,
  pricePerKg: 26000,
  deliverTime: "09:00",
};

const ORDERS_BY_WEEKDAY: Record<number, OrderPlan[]> = {
  0: [RESTAURANT_KEMBUNG],
  1: [SPPG_TONGKOL],
  2: [SPPG_CAKALANG, RESTAURANT_KEMBUNG],
  3: [SPPG_TONGKOL],
  4: [SPPG_CAKALANG, RESTAURANT_KEMBUNG],
  5: [],
  6: [SPPG_TONGKOL, RESTAURANT_KEMBUNG],
};

interface ScriptedLanding {
  fisher: string;
  speciesId: SpeciesId;
  weightKg: number;
  time: string;
  iced: boolean;
  quality: { eye: number; gill: number; odor: OdorOption; texture: TextureOption };
}

const PRIME = { eye: 8.6, gill: 8.4, odor: "sea_fresh", texture: "firm" } as const;
const PRIME_SOFTER = { eye: 8.4, gill: 8.1, odor: "sea_fresh", texture: "slightly_soft" } as const;
const PROCESSING = { eye: 6.2, gill: 5.9, odor: "sour", texture: "soft" } as const;

const SCRIPTED_LANDINGS: Record<string, ScriptedLanding[]> = {
  "2026-10-26": [{ fisher: "Darman", speciesId: "tongkol", weightKg: 18, time: "05:12", iced: true, quality: PRIME }],
  "2026-10-29": [{ fisher: "Darman", speciesId: "tongkol", weightKg: 9, time: "05:40", iced: false, quality: PROCESSING }],
  "2026-11-02": [
    { fisher: "Darman", speciesId: "tongkol", weightKg: 20, time: "05:08", iced: true, quality: PRIME },
    { fisher: "Edi", speciesId: "tongkol", weightKg: 12, time: "05:20", iced: true, quality: PRIME_SOFTER },
    { fisher: "Samsul", speciesId: "tongkol", weightKg: 8, time: "05:31", iced: true, quality: PRIME },
  ],
  "2026-11-04": [
    { fisher: "Darman", speciesId: "tongkol", weightKg: 22, time: "05:03", iced: true, quality: PRIME },
    { fisher: "Rusdi", speciesId: "tongkol", weightKg: 18, time: "05:16", iced: true, quality: PRIME_SOFTER },
    { fisher: "Bujang", speciesId: "kembung", weightKg: 6, time: "05:40", iced: false, quality: PROCESSING },
  ],
};

const SCRIPTED_INSTALLMENTS: Array<{ date: string; fisher: string; amount: number; lender: string }> = [
  { date: "2026-11-02", fisher: "Darman", amount: 100000, lender: TOKE_NAME },
  { date: "2026-11-04", fisher: "Darman", amount: 100000, lender: TOKE_NAME },
  { date: "2026-10-21", fisher: "Rusdi", amount: 75000, lender: COOPERATIVE_LENDER_NAME },
  { date: "2026-10-24", fisher: "Rusdi", amount: 75000, lender: COOPERATIVE_LENDER_NAME },
];

export interface HistoryRecords {
  landings: Landing[];
  gradings: Grading[];
  orders: Order[];
  batches: Batch[];
  batchItems: BatchItem[];
  receipts: Receipt[];
  payments: Payment[];
  ledger: LedgerEntry[];
  materials: ProcessingMaterial[];
}

export function portPriceOn(prices: readonly ReferencePrice[], speciesId: SpeciesId, date: string): number {
  const match = prices.find((price) => price.speciesId === speciesId && price.kind === "port" && price.date === date);
  if (!match) {
    throw new Error(`No port price for ${speciesId} on ${date}`);
  }
  return match.pricePerKg;
}

function minutesAfter(iso: string, minutes: number): string {
  return demoTimestamp(new Date(iso).getTime() + minutes * 60_000);
}

function clockTime(random: SeededRandom, fromMinutes: number, toMinutes: number): string {
  const minutes = random.integer(fromMinutes, toMinutes);
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

const GRADE_TARGETS: Record<"iced" | "uniced", Array<[Grade, number]>> = {
  iced: [
    ["A", 0.55],
    ["B", 0.3],
    ["C", 0.12],
    ["REJECT", 0.03],
  ],
  uniced: [
    ["A", 0.1],
    ["B", 0.35],
    ["C", 0.45],
    ["REJECT", 0.1],
  ],
};

const QUALITY_RANGES: Record<
  Grade,
  { eye: [number, number]; gill: [number, number]; odors: OdorOption[]; textures: TextureOption[] }
> = {
  A: { eye: [8, 9], gill: [7.8, 9], odors: ["sea_fresh"], textures: ["firm", "firm", "slightly_soft"] },
  B: {
    eye: [7, 8.3],
    gill: [6.9, 8.1],
    odors: ["sea_fresh", "neutral", "neutral"],
    textures: ["slightly_soft", "slightly_soft", "firm"],
  },
  C: { eye: [5.6, 7], gill: [5.3, 6.9], odors: ["neutral", "sour", "sour"], textures: ["slightly_soft", "soft"] },
  REJECT: { eye: [5, 6], gill: [5, 5.8], odors: ["sour", "rotten"], textures: ["soft", "very_soft"] },
};

function pickWeighted<T>(random: SeededRandom, options: Array<[T, number]>): T {
  let roll = random.next();
  for (const [value, weight] of options) {
    if (roll < weight) {
      return value;
    }
    roll -= weight;
  }
  return options[options.length - 1][0];
}

function qualityFromDraw(random: SeededRandom, iced: boolean) {
  const target = pickWeighted(random, GRADE_TARGETS[iced ? "iced" : "uniced"]);
  const range = QUALITY_RANGES[target];
  let quality = { eye: 0, gill: 0, odor: range.odors[0], texture: range.textures[0] };
  for (let attempt = 0; attempt < 24; attempt++) {
    quality = {
      eye: roundToOneDecimal(random.between(...range.eye)),
      gill: roundToOneDecimal(random.between(...range.gill)),
      odor: random.pick(range.odors),
      texture: random.pick(range.textures),
    };
    const parameters = {
      eye: quality.eye,
      gill: quality.gill,
      odor: ODOR_SCORE[quality.odor],
      texture: TEXTURE_SCORE[quality.texture],
    };
    if (gradeFromParameters(parameters, quality.odor) === target) {
      break;
    }
  }
  return quality;
}

export function buildGrading(
  landing: Landing,
  quality: { eye: number; gill: number; odor: OdorOption; texture: TextureOption },
  gradedAt: string,
): Grading {
  return buildGradingFromParameters({
    landing,
    parameters: {
      eye: quality.eye,
      gill: quality.gill,
      odor: ODOR_SCORE[quality.odor],
      texture: TEXTURE_SCORE[quality.texture],
    },
    odor: quality.odor,
    texture: quality.texture,
    eye: null,
    gill: null,
    eyeSource: "model",
    gillSource: "model",
    modelVersion: SIMULATED_MODEL_VERSION,
    gradedAt,
  });
}

export function batchCode(speciesId: SpeciesId, grade: Grade, date: string): string {
  return `${SPECIES_CODE[speciesId]}-${grade}-${date.slice(8, 10)}${date.slice(5, 7)}`;
}

function buyerById(id: string): Buyer {
  const buyer = BUYERS.find((candidate) => candidate.id === id);
  if (!buyer) {
    throw new Error(`Unknown buyer ${id}`);
  }
  return buyer;
}

export function createHistory(prices: readonly ReferencePrice[]): HistoryRecords {
  const random = createSeededRandom(20261105);
  const records: HistoryRecords = {
    landings: [],
    gradings: [],
    orders: [],
    batches: [],
    batchItems: [],
    receipts: [],
    payments: [],
    ledger: [],
    materials: [],
  };

  records.ledger.push(
    {
      id: "kas-darman-pinjaman",
      fisherId: fisherIdByName("Darman"),
      kind: "loan",
      amount: 3000000,
      counterparty: TOKE_NAME,
      note: "Pinjaman BBM",
      date: demoTime("2026-10-12", "16:20"),
      batchId: null,
      approval: "approved_verbally",
    },
    {
      id: "kas-rusdi-pinjaman",
      fisherId: fisherIdByName("Rusdi"),
      kind: "loan",
      amount: 1500000,
      counterparty: COOPERATIVE_LENDER_NAME,
      note: "Perbaikan mesin tempel",
      date: demoTime("2026-10-08", "10:05"),
      batchId: null,
      approval: "approved_by_link",
    },
  );

  const firstDate = addDays(DEMO_DATE, -HISTORY_DAYS);
  for (let offset = 0; offset < HISTORY_DAYS; offset++) {
    const date = addDays(firstDate, offset);
    const weekday = weekdayOf(date);
    if (weekday === NO_FISHING_WEEKDAY || STORM_DATES.has(date)) {
      continue;
    }

    const scripted = SCRIPTED_LANDINGS[date] ?? [];
    const scriptedFishers = new Set(scripted.map((landing) => landing.fisher));
    const chosen = FISHERS.filter(
      (fisher) => !scriptedFishers.has(fisher.name) && fisher.name !== "Darman" && random.chance(0.78),
    );

    const dayLandings: Array<{ landing: Landing; grading: Grading }> = [];
    const addLanding = (
      fisherName: string,
      speciesId: SpeciesId,
      weightKg: number,
      time: string,
      iced: boolean,
      quality: { eye: number; gill: number; odor: OdorOption; texture: TextureOption },
    ) => {
      const landedAt = demoTime(date, time);
      const landing: Landing = {
        id: `darat-${date}-${fisherName.toLowerCase()}`,
        fisherId: fisherIdByName(fisherName),
        speciesId,
        weightKg,
        landedAt,
        iced,
        destination: null,
      };
      dayLandings.push({ landing, grading: buildGrading(landing, quality, minutesAfter(landedAt, 6)) });
    };

    for (const entry of scripted) {
      addLanding(entry.fisher, entry.speciesId, entry.weightKg, entry.time, entry.iced, entry.quality);
    }
    for (const fisher of chosen) {
      const speciesId = random.chance(0.85) ? fisher.usualSpeciesId : random.pick(SPECIES).id;
      const iced = random.chance(0.9);
      addLanding(
        fisher.name,
        speciesId,
        random.integer(10, 28),
        clockTime(random, 4 * 60 + 5, 6 * 60 + 20),
        iced,
        qualityFromDraw(random, iced),
      );
    }
    dayLandings.sort((a, b) => a.landing.landedAt.localeCompare(b.landing.landedAt));

    const batchedKg = new Map<string, number>();
    for (const plan of ORDERS_BY_WEEKDAY[weekday]) {
      const buyer = buyerById(plan.buyerId);
      const deliverAt = demoTime(date, plan.deliverTime);
      const order: Order = {
        id: `pesanan-${date}-${plan.speciesId}`,
        buyerId: plan.buyerId,
        speciesId: plan.speciesId,
        minimumGrade: plan.minimumGrade,
        targetKg: plan.targetKg,
        pricePerKg: plan.pricePerKg,
        deliverAt,
        address: buyer.address,
        downPaymentRate: 0.3,
        placedAt: demoTime(addDays(date, -1), clockTime(random, 13 * 60, 17 * 60)),
        status: "fulfilled",
      };
      const batchId = `batch-${date}-${plan.speciesId}`;
      const items: BatchItem[] = [];
      let filled = 0;
      for (const { landing, grading } of dayLandings) {
        if (filled >= plan.targetKg) {
          break;
        }
        const species = SPECIES.find((candidate) => candidate.id === landing.speciesId)!;
        const blockedForSppg =
          buyer.kind === "sppg" &&
          sppgIneligibilityReason({
            histamineRisk: species.histamineRisk,
            iced: landing.iced,
            landedAt: new Date(landing.landedAt),
            now: new Date(deliverAt),
            window: species.freshnessWindow,
          }) !== null;
        const available = landing.weightKg - (batchedKg.get(landing.id) ?? 0);
        if (
          landing.speciesId !== plan.speciesId ||
          !isGradeAtLeast(grading.grade, plan.minimumGrade) ||
          blockedForSppg ||
          available <= 0
        ) {
          continue;
        }
        const kg = Math.min(available, plan.targetKg - filled);
        items.push({ batchId, landingId: landing.id, kg });
        batchedKg.set(landing.id, (batchedKg.get(landing.id) ?? 0) + kg);
        landing.destination = "batch";
        filled += kg;
      }
      if (items.length === 0) {
        order.status = "cancelled";
        records.orders.push(order);
        continue;
      }

      const departedAt = minutesAfter(deliverAt, -40);
      const receivedAt = minutesAfter(deliverAt, 10);
      const acceptedKg = date === PARTIAL_RECEIPT_ORDER_DATE ? filled - 2 : filled;
      const isLate = date === LATE_PAYMENT_ORDER_DATE && plan.buyerId === RESTAURANT_BUYER_ID;
      const paidAt = isLate ? minutesAfter(receivedAt, 3 * 24 * 60) : minutesAfter(receivedAt, random.integer(60, 150));

      records.orders.push(order);
      records.batches.push({
        id: batchId,
        code: batchCode(plan.speciesId, plan.minimumGrade, date),
        orderId: order.id,
        status: "received",
        fillDeadline: minutesAfter(deliverAt, -60),
        labelledAt: minutesAfter(deliverAt, -55),
        departedAt,
        checklist: { enoughIce: true, closedContainer: true, labelAttached: true, courier: "Pak Udin" },
      });
      records.batchItems.push(...items);
      records.receipts.push({
        batchId,
        decision: acceptedKg < filled ? "accept_partial" : "accept_all",
        acceptedKg,
        recheckScore: acceptedKg < filled ? 6.6 : null,
        reason: acceptedKg < filled ? "2 kg lunak saat cek ulang" : null,
        note: null,
        receivedAt,
      });
      records.payments.push({
        batchId,
        amount: acceptedKg * plan.pricePerKg,
        dueAt: minutesAfter(receivedAt, 24 * 60),
        paidAt,
        status: isLate ? "late" : "paid",
      });

      const fisherPrice = priceBreakdown(plan.pricePerKg, buyer.kind).fisherReceivesPerKg;
      const acceptedRatio = acceptedKg / filled;
      const share = splitRevenue({
        contributions: items.map((item) => ({
          fisherId: dayLandings.find(({ landing }) => landing.id === item.landingId)!.landing.fisherId,
          kg: roundToOneDecimal(item.kg * acceptedRatio),
        })),
        fisherPricePerKg: fisherPrice,
      });
      for (const line of share.lines) {
        records.ledger.push({
          id: `kas-${batchId}-${line.fisherId}`,
          fisherId: line.fisherId,
          kind: "income",
          amount: line.gross,
          counterparty: buyer.name,
          note: `${line.kg} kg × Rp${fisherPrice.toLocaleString("id-ID")}`,
          date: paidAt,
          batchId,
          approval: null,
        });
        const installment = SCRIPTED_INSTALLMENTS.find(
          (entry) => entry.date === date && fisherIdByName(entry.fisher) === line.fisherId,
        );
        if (installment) {
          records.ledger.push({
            id: `kas-${batchId}-${line.fisherId}-cicilan`,
            fisherId: line.fisherId,
            kind: "installment",
            amount: installment.amount,
            counterparty: installment.lender,
            note: "Cicilan dari bagi hasil",
            date: paidAt,
            batchId,
            approval: "approved_by_link",
          });
        }
      }
    }

    for (const { landing, grading } of dayLandings) {
      if (landing.destination === "batch") {
        continue;
      }
      if (grading.grade === "REJECT") {
        landing.destination = "not_for_consumption";
      } else if (grading.grade === "C") {
        landing.destination = "processing";
        const takenByProducer = landing.id === `darat-2026-10-29-darman` || random.chance(0.5);
        records.materials.push({
          id: `bahan-${landing.id}`,
          landingId: landing.id,
          kg: landing.weightKg,
          pricePerKg: roundToNearest(portPriceOn(prices, landing.speciesId, date) * GRADE_PRICE_MULTIPLIER.C, 50),
          takenByProducerId: takenByProducer && date < "2026-11-04" ? PRODUCER_ID : null,
          takenAt: takenByProducer && date < "2026-11-04" ? minutesAfter(landing.landedAt, 6 * 60) : null,
        });
      } else {
        landing.destination = "port_auction";
      }
    }

    records.landings.push(...dayLandings.map(({ landing }) => landing));
    records.gradings.push(...dayLandings.map(({ grading }) => grading));
  }

  return records;
}
