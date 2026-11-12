import { describe, expect, it } from "vitest";
import { DEMO_START } from "../demo-clock";
import { DEMO_BUYER_ID, DEMO_FISHER_ID, DEMO_PRODUCER_ID } from "../demo-identities";
import { batchView, batchesForBuyer } from "../queries/batches";
import { filterCounts, orderMoney } from "../queries/buyer-pages";
import { fisherLandings, landingStatus } from "../queries/fisher-pages";
import { payoutsFor, revenueShareForBatch } from "../queries/fishers";
import { publicBatchTrace } from "../queries/tracking";
import { checkLabelCompliance } from "@/domain/label-compliance";
import { createSeedDatabase } from "./index";
import { createHistory } from "./history";
import { createTodayScenario } from "./today";
import { SEED_PRODUCTS } from "./products";
import { createReferencePrices } from "./reference-prices";
import { EDGE_CANCELLED_BATCH_ID, EDGE_LATE_BATCH_ID, EDGE_PRODUCT_ID, EDGE_REJECTED_BATCH_ID, EDGE_REJECTED_CODE } from "./edge-cases";

const db = createSeedDatabase();

describe("additional demo scenarios", () => {
  it("keeps all original seed records and their order unchanged", () => {
    const prices = createReferencePrices();
    const history = createHistory(prices);
    const today = createTodayScenario(prices);
    for (const key of ["landings", "gradings", "orders", "batches", "batchItems", "ledger", "materials"] as const) {
      const original = [...history[key], ...today[key]];
      expect(db[key].slice(0, original.length), key).toEqual(original);
    }
    expect(db.receipts.slice(0, history.receipts.length)).toEqual(history.receipts);
    expect(db.payments.slice(0, history.payments.length)).toEqual(history.payments);
    expect(db.products.slice(0, SEED_PRODUCTS.length)).toEqual(SEED_PRODUCTS);
    expect(db.referencePrices).toEqual(prices);
  });

  it("rejects an SPPG shipment with a recheck and no payment or fisher income", () => {
    const view = batchView(db, EDGE_REJECTED_BATCH_ID, DEMO_START)!;
    expect(view.buyer.id).toBe(DEMO_BUYER_ID);
    expect(view.batch.status).toBe("rejected");
    expect(view.receipt).toMatchObject({ decision: "reject", acceptedKg: 0, recheckScore: 5.6 });
    expect(view.receipt!.reason).toMatch(/Insang kusam/);
    expect(view.payment).toBeNull();
    expect(db.ledger.filter((entry) => entry.batchId === view.batch.id)).toEqual([]);
    expect(revenueShareForBatch(db, view.batch.id).totalNet).toBe(0);
    expect(payoutsFor(db, DEMO_FISHER_ID).some((item) => item.batchId === view.batch.id)).toBe(false);
    expect(landingStatus(db, view.contributions[0].landing.id, DEMO_FISHER_ID).kind).toBe("rejected");
    expect(orderMoney(view)).toMatchObject({ total: 0, down: 0, remaining: 0, paid: false, estimated: false });
    const trace = publicBatchTrace(db, EDGE_REJECTED_CODE, DEMO_START)!;
    expect(trace.status).toBe("rejected");
    expect(trace.contributions.every((item) => item.hashMatches)).toBe(true);
    expect(JSON.stringify(trace)).not.toMatch(/Darman|"whatsapp"|"reason"|"note"|"evidencePhotoDataUrl"/);
  });

  it("cancels an unfilled SPPG order and releases its fish to TPI without charging", () => {
    const view = batchView(db, EDGE_CANCELLED_BATCH_ID, DEMO_START)!;
    expect(view.buyer.id).toBe(DEMO_BUYER_ID);
    expect(view.batch.status).toBe("cancelled");
    expect(view.order.status).toBe("cancelled");
    expect(view.contributions).toEqual([]);
    expect(db.landings.find((item) => item.id === `darat-${view.batch.id}`)?.destination).toBe("port_auction");
    expect(view.receipt).toBeNull();
    expect(view.payment).toBeNull();
    expect(orderMoney(view)).toMatchObject({ total: 0, down: 0, remaining: 0, paid: false });
    expect(db.auditLog.some((entry) => entry.entity === view.batch.id && /6 dari 30 kg/.test(entry.detail))).toBe(true);
    const counts = filterCounts(batchesForBuyer(db, DEMO_BUYER_ID, DEMO_START));
    expect(counts.dibatalkan).toBeGreaterThan(0);
    expect(counts.ditolak).toBeGreaterThan(0);
  });

  it("records the additional SPPG late payment with consistent revenue shares", () => {
    const view = batchView(db, EDGE_LATE_BATCH_ID, DEMO_START)!;
    expect(view.buyer.id).toBe(DEMO_BUYER_ID);
    expect(view.receipt!.acceptedKg).toBe(8);
    expect(view.payment).toMatchObject({ status: "late", amount: 160000 });
    expect(new Date(view.payment!.paidAt!).getTime()).toBeGreaterThan(new Date(view.payment!.dueAt).getTime());
    const income = db.ledger.filter((entry) => entry.batchId === view.batch.id && entry.kind === "income");
    expect(income.reduce((sum, entry) => sum + entry.amount, 0)).toBe(revenueShareForBatch(db, view.batch.id).totalGross);
    expect(income.every((entry) => entry.date === view.payment!.paidAt)).toBe(true);
    expect(db.auditLog.some((entry) => entry.entity === view.batch.id && entry.action === "late_payment")).toBe(true);
  });

  it("includes Darman landings for processing and TPI with valid origins", () => {
    const rows = fisherLandings(db, DEMO_FISHER_ID);
    expect(rows.some((row) => row.status.kind === "port")).toBe(true);
    const processed = rows.find((row) => row.status.kind === "processing")!;
    expect(processed).toBeDefined();
    expect(processed.view.grading?.grade).toBe("C");
    expect(db.materials.some((item) => item.landingId === processed.view.landing.id)).toBe(true);
  });

  it("blocks a product missing P-IRT and containing a forbidden cure claim", () => {
    const product = db.products.find((item) => item.id === EDGE_PRODUCT_ID)!;
    expect(product.producerId).toBe(DEMO_PRODUCER_ID);
    const compliance = checkLabelCompliance(product.label);
    expect(compliance.readyToPrint).toBe(false);
    expect(compliance.checks.find((item) => item.requirement === "pirt_number")?.satisfied).toBe(false);
    expect(compliance.forbiddenClaims).toContain("cure_claim");
  });
});
