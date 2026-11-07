import { cancelUnfilledBatch, receiveBatch, type CommandContext } from "../commands";
import { addDays, demoTime } from "../demo-clock";
import { buildGradingFromParameters } from "../grading-record";
import type { DemoDatabase, Landing, Product, SpeciesId } from "../types";
import { fisherIdByName, SPPG_BUYER_ID } from "./catalog";
import { SIMULATED_MODEL_VERSION } from "./history";

export const EDGE_REJECTED_BATCH_ID = "batch-contoh-ditolak-sppg";
export const EDGE_REJECTED_CODE = "TGK-A-0311-R";
export const EDGE_CANCELLED_BATCH_ID = "batch-contoh-batal-sppg";
export const EDGE_CANCELLED_CODE = "CKL-B-0211-X";
export const EDGE_LATE_BATCH_ID = "batch-contoh-terlambat-sppg";
export const EDGE_LATE_CODE = "KMB-A-0111-L";
export const EDGE_PRODUCT_ID = "produk-abon-tongkol-belum-lengkap";

// Append-only scenarios: no shared random generator and no edits to old records.
function shipment(db: DemoDatabase, input: {
  id: string; code: string; date: string; speciesId: SpeciesId;
  fisher: string; kg: number; targetKg: number; filling?: boolean;
}): DemoDatabase {
  const buyer = db.buyers.find((item) => item.id === SPPG_BUYER_ID)!;
  const orderId = `pesanan-${input.id}`;
  const landing: Landing = {
    id: `darat-${input.id}`, fisherId: fisherIdByName(input.fisher),
    speciesId: input.speciesId, weightKg: input.kg,
    landedAt: demoTime(input.date, "05:20"), iced: true, destination: "batch",
  };
  const grading = buildGradingFromParameters({
    landing, parameters: { eye: 8.4, gill: 8.4, odor: 9, texture: 8 },
    odor: "sea_fresh", texture: "slightly_soft", eye: null, gill: null,
    eyeSource: "person", gillSource: "person", modelVersion: SIMULATED_MODEL_VERSION,
    gradedAt: demoTime(input.date, "05:22"),
  });
  return {
    ...db,
    landings: [...db.landings, landing],
    gradings: [...db.gradings, grading],
    orders: [...db.orders, {
      id: orderId, buyerId: buyer.id, speciesId: input.speciesId,
      minimumGrade: input.speciesId === "cakalang" ? "B" : "A",
      targetKg: input.targetKg, pricePerKg: 20000,
      deliverAt: demoTime(input.date, "08:00"), address: buyer.address,
      downPaymentRate: 0, placedAt: demoTime(addDays(input.date, -1), "19:40"), status: "filling",
    }],
    batches: [...db.batches, {
      id: input.id, code: input.code, orderId, status: input.filling ? "filling" : "in_transit",
      fillDeadline: demoTime(input.date, "07:00"),
      labelledAt: input.filling ? null : demoTime(input.date, "07:05"),
      departedAt: input.filling ? null : demoTime(input.date, "07:20"),
      checklist: input.filling ? null : { enoughIce: true, closedContainer: true, labelAttached: true, courier: "Pak Udin" },
    }],
    batchItems: [...db.batchItems, { batchId: input.id, landingId: landing.id, kg: input.kg }],
    auditLog: [...db.auditLog, {
      id: `audit-${input.id}-nilai`, at: grading.gradedAt, actor: "Bu Sari · demo",
      action: "save_grading", entity: landing.id, detail: "Catatan contoh tambahan; nilai awal sebelum kiriman diperiksa ulang.",
    }],
  };
}

function incompleteProduct(db: DemoDatabase): Product {
  const source = db.products[0];
  return {
    ...source, id: EDGE_PRODUCT_ID, materialId: null,
    name: "Abon Tongkol (draf contoh)", spokenDescription: "Draf untuk memeriksa label yang belum lengkap",
    run: { ...source.run, rawFishKg: 3, yieldRatio: 0.4, packNetWeightGrams: 100 },
    label: {
      ...source.label, productName: "Abon Tongkol", netWeightGrams: 100,
      ingredients: ["ikan tongkol", "santan", "bawang", "garam"],
      productionCode: "SJ-CONTOH-0311", productionDate: "2026-11-03", bestBefore: "2026-12-03",
      pirtNumber: "", halalCertificateNumber: "",
      marketingText: "Contoh klaim yang harus dihapus: menyembuhkan penyakit.",
    },
    captions: { whatsappStatus: "", marketplace: "", instagram: "" },
  };
}

export function withEdgeCases(base: DemoDatabase): DemoDatabase {
  let counter = 0;
  const context = (date: string, time: string): CommandContext => ({
    now: new Date(demoTime(date, time)), actor: "Bu Sari · demo",
    newId: (prefix) => `${prefix}-contoh-${++counter}`,
  });
  let db = shipment(base, {
    id: EDGE_REJECTED_BATCH_ID, code: EDGE_REJECTED_CODE, date: "2026-11-03",
    speciesId: "tongkol", fisher: "Darman", kg: 10, targetKg: 10,
  });
  db = receiveBatch(db, {
    batchId: EDGE_REJECTED_BATCH_ID, decision: "reject", acceptedKg: 0,
    reason: "Insang kusam dan es hampir habis saat cek ulang",
    note: "Peti terasa hangat saat diperiksa manusia; suhu tidak diukur. Ikan ditahan untuk pemeriksaan KUB, tidak dibayar atau langsung diolah.",
    recheckScore: 5.6,
  }, context("2026-11-03", "08:10")).db;

  db = shipment(db, {
    id: EDGE_CANCELLED_BATCH_ID, code: EDGE_CANCELLED_CODE, date: "2026-11-02",
    speciesId: "cakalang", fisher: "Darman", kg: 6, targetKg: 30, filling: true,
  });
  db = cancelUnfilledBatch(db, { batchId: EDGE_CANCELLED_BATCH_ID }, context("2026-11-02", "07:01")).db;
  db = { ...db, auditLog: [...db.auditLog, {
    id: "audit-contoh-batal-alasan", at: demoTime("2026-11-02", "07:01"), actor: "Bu Sari · demo",
    action: "cancellation_reason", entity: EDGE_CANCELLED_BATCH_ID,
    detail: "Hanya 6 dari 30 kg tersedia sampai batas isi. Pesanan dibatalkan; 6 kg dialihkan ke TPI tanpa tagihan pembeli.",
  }] };

  // The existing late payment belongs to the restaurant, not the SPPG persona.
  db = shipment(db, {
    id: EDGE_LATE_BATCH_ID, code: EDGE_LATE_CODE, date: "2026-11-01",
    speciesId: "kembung", fisher: "Joni", kg: 8, targetKg: 8,
  });
  db = receiveBatch(db, {
    batchId: EDGE_LATE_BATCH_ID, decision: "accept_all", acceptedKg: 8,
    reason: null, note: "Contoh pembayaran SPPG yang melewati tenggat.", recheckScore: null,
  }, context("2026-11-01", "08:10")).db;
  const lateAt = demoTime("2026-11-03", "09:15");
  return {
    ...db,
    payments: db.payments.map((payment) => payment.batchId === EDGE_LATE_BATCH_ID
      ? { ...payment, paidAt: lateAt, status: "late" } : payment),
    ledger: db.ledger.map((entry) => entry.batchId === EDGE_LATE_BATCH_ID ? { ...entry, date: lateAt } : entry),
    products: [...db.products, incompleteProduct(base)],
    auditLog: [...db.auditLog, {
      id: "audit-contoh-bayar-terlambat", at: lateAt, actor: "Bu Sari · demo",
      action: "late_payment", entity: EDGE_LATE_BATCH_ID,
      detail: "Pembayaran simulasi Rp160.000 diterima setelah tenggat 2 November; pendapatan nelayan dicatat saat pembayaran.",
    }],
  };
}
