import { eyeScore, gillScore, type EyeProbabilities, type GillProbabilities, type OdorOption, type TextureOption } from "@/domain/freshness-score";
import { isSellableGrade, type Grade } from "@/domain/grade";
import { GRADE_PRICE_MULTIPLIER, roundToNearest } from "@/domain/pricing";
import { demoTimestamp, localDateOf } from "./demo-clock";
import { buildGradingFromParameters, humanParameterScores, sealGrading } from "./grading-record";
import { revenueShareForBatch } from "./queries/fishers";
import { averagePortPrice } from "./queries/prices";
import { batchCode } from "./seed/history";
import type {
  AssessmentSource,
  AuditEntry,
  Batch,
  DemoDatabase,
  Grading,
  Landing,
  LandingDestination,
  LedgerEntry,
  Order,
  Product,
  Receipt,
  ReceiptDecision,
  ShippingChecklist,
  SpeciesId,
} from "./types";

export interface CommandContext {
  now: Date;
  actor: string;
  newId: (prefix: string) => string;
}

export interface CommandResult<T> {
  db: DemoDatabase;
  result: T;
}

export class CommandRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommandRejectedError";
  }
}

function audit(db: DemoDatabase, ctx: CommandContext, action: string, entity: string, detail: string): DemoDatabase {
  const entry: AuditEntry = { id: ctx.newId("audit"), at: demoTimestamp(ctx.now), actor: ctx.actor, action, entity, detail };
  return { ...db, auditLog: [...db.auditLog, entry] };
}

function requireLanding(db: DemoDatabase, landingId: string): Landing {
  const landing = db.landings.find((candidate) => candidate.id === landingId);
  if (!landing) {
    throw new CommandRejectedError(`Unknown landing ${landingId}`);
  }
  return landing;
}

function requireBatch(db: DemoDatabase, batchId: string): Batch {
  const batch = db.batches.find((candidate) => candidate.id === batchId);
  if (!batch) {
    throw new CommandRejectedError(`Unknown batch ${batchId}`);
  }
  return batch;
}

const replaceBatch = (db: DemoDatabase, batch: Batch): DemoDatabase => ({
  ...db,
  batches: db.batches.map((candidate) => (candidate.id === batch.id ? batch : candidate)),
});

export interface NewLanding {
  fisherId: string;
  speciesId: SpeciesId;
  weightKg: number;
  iced: boolean;
}

export function recordLanding(db: DemoDatabase, input: NewLanding, ctx: CommandContext): CommandResult<Landing> {
  if (input.weightKg <= 0) {
    throw new CommandRejectedError("Weight must be positive");
  }
  const landing: Landing = {
    id: ctx.newId("darat"),
    fisherId: input.fisherId,
    speciesId: input.speciesId,
    weightKg: input.weightKg,
    landedAt: demoTimestamp(ctx.now),
    iced: input.iced,
    destination: null,
  };
  return { db: audit({ ...db, landings: [...db.landings, landing] }, ctx, "record_landing", landing.id, `${input.weightKg} kg`), result: landing };
}

export function updateLanding(
  db: DemoDatabase,
  input: { landingId: string } & Partial<NewLanding>,
  ctx: CommandContext,
): CommandResult<Landing> {
  const landing = requireLanding(db, input.landingId);
  if (db.gradings.some((grading) => grading.landingId === landing.id)) {
    throw new CommandRejectedError("A graded landing can no longer be edited");
  }
  if (input.weightKg !== undefined && input.weightKg <= 0) {
    throw new CommandRejectedError("Weight must be positive");
  }
  const updated: Landing = {
    ...landing,
    fisherId: input.fisherId ?? landing.fisherId,
    speciesId: input.speciesId ?? landing.speciesId,
    weightKg: input.weightKg ?? landing.weightKg,
    iced: input.iced ?? landing.iced,
  };
  return {
    db: audit(
      { ...db, landings: db.landings.map((candidate) => (candidate.id === landing.id ? updated : candidate)) },
      ctx,
      "update_landing",
      landing.id,
      `${updated.weightKg} kg`,
    ),
    result: updated,
  };
}

export interface NewGrading {
  landingId: string;
  eye: EyeProbabilities;
  gill: GillProbabilities;
  eyeSource: AssessmentSource;
  gillSource: AssessmentSource;
  odor: OdorOption;
  texture: TextureOption;
  modelVersion: string;
}

export function saveGrading(db: DemoDatabase, input: NewGrading, ctx: CommandContext): CommandResult<Grading> {
  const landing = requireLanding(db, input.landingId);
  const grading = buildGradingFromParameters({
    landing,
    parameters: { eye: eyeScore(input.eye), gill: gillScore(input.gill), ...humanParameterScores(input.odor, input.texture) },
    odor: input.odor,
    texture: input.texture,
    eye: input.eye,
    gill: input.gill,
    eyeSource: input.eyeSource,
    gillSource: input.gillSource,
    modelVersion: input.modelVersion,
    gradedAt: demoTimestamp(ctx.now),
  });
  const gradings = [...db.gradings.filter((candidate) => candidate.landingId !== landing.id), grading];
  return { db: audit({ ...db, gradings }, ctx, "grade_landing", landing.id, `${grading.grade} ${grading.finalScore}`), result: grading };
}

export function overrideGrade(
  db: DemoDatabase,
  input: { landingId: string; grade: Grade; reason: string },
  ctx: CommandContext,
): CommandResult<Grading> {
  const landing = requireLanding(db, input.landingId);
  const existing = db.gradings.find((candidate) => candidate.landingId === landing.id);
  if (!existing) {
    throw new CommandRejectedError("Grade the landing before overriding it");
  }
  if (!input.reason.trim()) {
    throw new CommandRejectedError("An override needs a reason");
  }
  const grading = sealGrading(landing, { ...existing, grade: input.grade, overrideReason: input.reason });
  return {
    db: audit(
      { ...db, gradings: db.gradings.map((candidate) => (candidate.id === existing.id ? grading : candidate)) },
      ctx,
      "override_grade",
      landing.id,
      `${existing.modelGrade} → ${input.grade}: ${input.reason}`,
    ),
    result: grading,
  };
}

export interface RoutingResult {
  batchedKg: number;
  leftoverKg: number;
}

export function routeLanding(
  db: DemoDatabase,
  input: { landingId: string; destination: LandingDestination; batchId?: string },
  ctx: CommandContext,
): CommandResult<RoutingResult> {
  const landing = requireLanding(db, input.landingId);
  const grading = db.gradings.find((candidate) => candidate.landingId === landing.id);
  if (!grading) {
    throw new CommandRejectedError("Grade the landing before routing it");
  }
  if (input.destination !== "not_for_consumption" && !isSellableGrade(grading.grade)) {
    throw new CommandRejectedError("Rejected fish can only be recorded as not for consumption");
  }
  const withDestination = (destination: LandingDestination): DemoDatabase => ({
    ...db,
    landings: db.landings.map((candidate) => (candidate.id === landing.id ? { ...candidate, destination } : candidate)),
  });

  if (input.destination === "batch") {
    const batch = requireBatch(db, input.batchId ?? "");
    const order = db.orders.find((candidate) => candidate.id === batch.orderId)!;
    const filled = db.batchItems.filter((item) => item.batchId === batch.id).reduce((sum, item) => sum + item.kg, 0);
    const alreadyBatched = db.batchItems
      .filter((item) => item.landingId === landing.id)
      .reduce((sum, item) => sum + item.kg, 0);
    const kg = Math.min(landing.weightKg - alreadyBatched, order.targetKg - filled);
    if (batch.status !== "filling" || kg <= 0) {
      throw new CommandRejectedError("This order cannot take more fish");
    }
    const next = withDestination("batch");
    const isNowFull = filled + kg >= order.targetKg;
    const updated: DemoDatabase = {
      ...next,
      batchItems: [...next.batchItems, { batchId: batch.id, landingId: landing.id, kg }],
      batches: next.batches.map((candidate) =>
        candidate.id === batch.id && isNowFull ? { ...candidate, status: "full" } : candidate,
      ),
    };
    return {
      db: audit(updated, ctx, "fill_batch", batch.id, `${kg} kg dari ${landing.id}`),
      result: { batchedKg: kg, leftoverKg: landing.weightKg - alreadyBatched - kg },
    };
  }

  let next = withDestination(input.destination);
  if (input.destination === "processing") {
    const date = localDateOf(ctx.now);
    const portPrice = averagePortPrice(db, landing.speciesId, date).pricePerKg;
    next = {
      ...next,
      materials: [
        ...next.materials,
        {
          id: `bahan-${landing.id}`,
          landingId: landing.id,
          kg: landing.weightKg,
          pricePerKg: roundToNearest(portPrice * GRADE_PRICE_MULTIPLIER.C, 50),
          takenByProducerId: null,
          takenAt: null,
        },
      ],
    };
  }
  return {
    db: audit(next, ctx, "route_landing", landing.id, input.destination),
    result: { batchedKg: 0, leftoverKg: landing.weightKg },
  };
}

export function labelBatch(db: DemoDatabase, input: { batchId: string }, ctx: CommandContext): CommandResult<Batch> {
  const batch = requireBatch(db, input.batchId);
  if (!["filling", "full", "labelled"].includes(batch.status)) {
    throw new CommandRejectedError("Only batches that have not left can be labelled");
  }
  const updated: Batch = { ...batch, status: "labelled", labelledAt: batch.labelledAt ?? demoTimestamp(ctx.now) };
  return { db: audit(replaceBatch(db, updated), ctx, "label_batch", batch.id, batch.code), result: updated };
}

export function departBatch(
  db: DemoDatabase,
  input: { batchId: string; checklist: ShippingChecklist },
  ctx: CommandContext,
): CommandResult<Batch> {
  const batch = requireBatch(db, input.batchId);
  const { enoughIce, closedContainer, labelAttached, courier } = input.checklist;
  if (batch.status !== "labelled") {
    throw new CommandRejectedError("Label the batch before it leaves");
  }
  if (!enoughIce || !closedContainer || !labelAttached || !courier.trim()) {
    throw new CommandRejectedError("Every checklist item must be confirmed");
  }
  const updated: Batch = { ...batch, status: "in_transit", departedAt: demoTimestamp(ctx.now), checklist: input.checklist };
  return { db: audit(replaceBatch(db, updated), ctx, "depart_batch", batch.id, courier), result: updated };
}

export function cancelUnfilledBatch(db: DemoDatabase, input: { batchId: string }, ctx: CommandContext): CommandResult<Batch> {
  const batch = requireBatch(db, input.batchId);
  if (batch.status !== "filling") {
    throw new CommandRejectedError("Only a batch that is still filling can be cancelled");
  }
  const landingIds = new Set(db.batchItems.filter((item) => item.batchId === batch.id).map((item) => item.landingId));
  const updated: Batch = { ...batch, status: "cancelled" };
  const next: DemoDatabase = {
    ...replaceBatch(db, updated),
    batchItems: db.batchItems.filter((item) => item.batchId !== batch.id),
    landings: db.landings.map((landing) =>
      landingIds.has(landing.id) ? { ...landing, destination: "port_auction" } : landing,
    ),
    orders: db.orders.map((order) => (order.id === batch.orderId ? { ...order, status: "cancelled" } : order)),
  };
  return { db: audit(next, ctx, "cancel_batch", batch.id, "dijual ke TPI"), result: updated };
}

export function receiveBatch(
  db: DemoDatabase,
  input: { batchId: string; decision: ReceiptDecision; acceptedKg: number; reason: string | null; note: string | null; recheckScore: number | null; evidencePhotoDataUrl?: string | null },
  ctx: CommandContext,
): CommandResult<Receipt> {
  const batch = requireBatch(db, input.batchId);
  if (batch.status !== "in_transit") {
    throw new CommandRejectedError("Only a batch in transit can be received");
  }
  const order = db.orders.find((candidate) => candidate.id === batch.orderId)!;
  const filledKg = db.batchItems.filter((item) => item.batchId === batch.id).reduce((sum, item) => sum + item.kg, 0);
  const acceptedKg = input.decision === "reject" ? 0 : input.decision === "accept_all" ? filledKg : input.acceptedKg;
  if (!Number.isFinite(acceptedKg) || acceptedKg < 0 || acceptedKg > filledKg || (input.decision === "accept_partial" && (acceptedKg <= 0 || acceptedKg >= filledKg))) {
    throw new CommandRejectedError("Accepted weight must be between zero and the shipped weight");
  }
  if (input.decision !== "accept_all" && !input.reason?.trim()) {
    throw new CommandRejectedError("A partial acceptance or rejection needs a reason");
  }
  const now = demoTimestamp(ctx.now);
  const receipt: Receipt = {
    batchId: batch.id,
    decision: input.decision,
    acceptedKg,
    recheckScore: input.recheckScore,
    reason: input.reason,
    note: input.note,
    receivedAt: now,
    evidencePhotoDataUrl: input.evidencePhotoDataUrl ?? null,
  };
  let next: DemoDatabase = {
    ...replaceBatch(db, { ...batch, status: input.decision === "reject" ? "rejected" : "received" }),
    receipts: [...db.receipts, receipt],
    orders: db.orders.map((candidate) => (candidate.id === order.id ? { ...candidate, status: "fulfilled" } : candidate)),
  };
  if (input.decision !== "reject") {
    next = {
      ...next,
      payments: [
        ...next.payments,
        {
          batchId: batch.id,
          amount: acceptedKg * order.pricePerKg,
          dueAt: demoTimestamp(ctx.now.getTime() + 24 * 3_600_000),
          paidAt: now,
          status: "paid",
        },
      ],
    };
    const buyer = db.buyers.find((candidate) => candidate.id === order.buyerId)!;
    const share = revenueShareForBatch(next, batch.id);
    const incomes: LedgerEntry[] = share.lines.map((line) => ({
      id: ctx.newId("kas"),
      fisherId: line.fisherId,
      kind: "income",
      amount: line.gross,
      counterparty: buyer.name,
      note: `${line.kg} kg × Rp${line.pricePerKg.toLocaleString("id-ID")}`,
      date: now,
      batchId: batch.id,
      approval: null,
    }));
    next = { ...next, ledger: [...next.ledger, ...incomes] };
  }
  return { db: audit(next, ctx, "receive_batch", batch.id, `${input.decision} ${acceptedKg} kg`), result: receipt };
}

export function decideDeduction(
  db: DemoDatabase,
  input: { entryId: string; approve: boolean; via: "link" | "verbal" },
  ctx: CommandContext,
): CommandResult<LedgerEntry> {
  const entry = db.ledger.find((candidate) => candidate.id === input.entryId);
  if (!entry || entry.kind !== "installment") {
    throw new CommandRejectedError("Unknown installment request");
  }
  const updated: LedgerEntry = {
    ...entry,
    approval: input.approve ? (input.via === "link" ? "approved_by_link" : "approved_verbally") : "declined",
  };
  return {
    db: audit(
      { ...db, ledger: db.ledger.map((candidate) => (candidate.id === entry.id ? updated : candidate)) },
      ctx,
      "decide_deduction",
      entry.id,
      updated.approval ?? "",
    ),
    result: updated,
  };
}

export interface NewOrder {
  buyerId: string;
  speciesId: SpeciesId;
  minimumGrade: Grade;
  targetKg: number;
  pricePerKg: number;
  deliverAt: string;
  address: string;
}

export function placeOrder(db: DemoDatabase, input: NewOrder, ctx: CommandContext): CommandResult<Order> {
  if (input.targetKg <= 0 || input.pricePerKg <= 0) {
    throw new CommandRejectedError("Weight and price must be positive");
  }
  const order: Order = {
    id: ctx.newId("pesanan"),
    buyerId: input.buyerId,
    speciesId: input.speciesId,
    minimumGrade: input.minimumGrade,
    targetKg: input.targetKg,
    pricePerKg: input.pricePerKg,
    deliverAt: input.deliverAt,
    address: input.address,
    downPaymentRate: 0.3,
    placedAt: demoTimestamp(ctx.now),
    status: "open",
  };
  const date = localDateOf(input.deliverAt);
  const sameCode = db.batches.filter((batch) => batch.code.startsWith(batchCode(input.speciesId, input.minimumGrade, date))).length;
  const batch: Batch = {
    id: ctx.newId("batch"),
    code: `${batchCode(input.speciesId, input.minimumGrade, date)}${sameCode ? `-${sameCode + 1}` : ""}`,
    orderId: order.id,
    status: "filling",
    fillDeadline: demoTimestamp(new Date(input.deliverAt).getTime() - 30 * 60_000),
    labelledAt: null,
    departedAt: null,
    checklist: null,
  };
  return {
    db: audit({ ...db, orders: [...db.orders, order], batches: [...db.batches, batch] }, ctx, "place_order", order.id, batch.code),
    result: order,
  };
}

export function takeMaterial(
  db: DemoDatabase,
  input: { materialId: string; producerId: string },
  ctx: CommandContext,
): CommandResult<void> {
  const material = db.materials.find((candidate) => candidate.id === input.materialId);
  const grading = material ? db.gradings.find((candidate) => candidate.landingId === material.landingId) : null;
  if (!db.producers.some((producer) => producer.id === input.producerId) || grading?.grade !== "C" || !material || material.takenByProducerId) {
    throw new CommandRejectedError("This material is no longer available");
  }
  return {
    db: audit(
      {
        ...db,
        materials: db.materials.map((candidate) =>
          candidate.id === material.id
            ? { ...candidate, takenByProducerId: input.producerId, takenAt: demoTimestamp(ctx.now) }
            : candidate,
        ),
      },
      ctx,
      "take_material",
      material.id,
      `${material.kg} kg`,
    ),
    result: undefined,
  };
}

export function saveProduct(db: DemoDatabase, product: Product, ctx: CommandContext): CommandResult<Product> {
  const existing = db.products.find((candidate) => candidate.id === product.id);
  const material = product.materialId ? db.materials.find((candidate) => candidate.id === product.materialId) : null;
  if (!db.producers.some((producer) => producer.id === product.producerId) || !product.name.trim() || (existing && existing.producerId !== product.producerId)) {
    throw new CommandRejectedError("Invalid producer or product name");
  }
  if (product.materialId && (!material || product.run.rawFishKg > material.kg || material.takenByProducerId !== product.producerId || db.products.some((candidate) => candidate.id !== product.id && candidate.materialId === product.materialId))) {
    throw new CommandRejectedError("The material must be reserved by this producer and used only once");
  }
  const exists = Boolean(existing);
  return {
    db: audit(
      {
        ...db,
        products: exists
          ? db.products.map((candidate) => (candidate.id === product.id ? product : candidate))
          : [...db.products, product],
      },
      ctx,
      "save_product",
      product.id,
      product.name,
    ),
    result: product,
  };
}
