import type { FreshnessWindow } from "@/domain/cold-chain";
import type { ProductionRun } from "@/domain/cost-of-goods";
import type {
  EyeProbabilities,
  GillProbabilities,
  OdorOption,
  ParameterScores,
  TextureOption,
} from "@/domain/freshness-score";
import type { Grade } from "@/domain/grade";
import type { LabelDraft } from "@/domain/label-compliance";
import type { BuyerKind } from "@/domain/pricing";
import type { DeductionStatus } from "@/domain/revenue-share";

export type SpeciesId = "tongkol" | "cakalang" | "kembung";

export interface Kub {
  id: string;
  name: string;
  village: string;
  district: string;
  regency: string;
  port: string;
  legalForm: string;
  operatorName: string;
}

export interface Fisher {
  id: string;
  memberNumber: number;
  name: string;
  initials: string;
  boatGrossTonnage: number;
  usualSpeciesId: SpeciesId;
  whatsapp: string;
}

export interface FishSpecies {
  id: SpeciesId;
  name: string;
  latinName: string;
  histamineRisk: boolean;
  freshnessWindow: FreshnessWindow;
}

export type ReferencePriceKind = "port" | "consumer";

export interface ReferencePrice {
  speciesId: SpeciesId;
  kind: ReferencePriceKind;
  date: string;
  pricePerKg: number;
  source: string;
  location: string;
  simulated: boolean;
}

export interface Buyer {
  id: string;
  kind: BuyerKind;
  name: string;
  contactName: string;
  address: string;
  district: string;
}

export type LandingDestination = "batch" | "port_auction" | "processing" | "not_for_consumption";

export interface Landing {
  id: string;
  fisherId: string;
  speciesId: SpeciesId;
  weightKg: number;
  landedAt: string;
  iced: boolean;
  destination: LandingDestination | null;
}

export interface Grading {
  id: string;
  landingId: string;
  eye: EyeProbabilities | null;
  gill: GillProbabilities | null;
  odor: OdorOption;
  texture: TextureOption;
  parameters: ParameterScores;
  finalScore: number;
  modelGrade: Grade;
  grade: Grade;
  overrideReason: string | null;
  modelVersion: string;
  gradedAt: string;
  auditHash: string;
}

export type OrderStatus = "open" | "filling" | "fulfilled" | "cancelled";

export interface Order {
  id: string;
  buyerId: string;
  speciesId: SpeciesId;
  minimumGrade: Grade;
  targetKg: number;
  pricePerKg: number;
  deliverAt: string;
  address: string;
  downPaymentRate: number;
  placedAt: string;
  status: OrderStatus;
}

export type BatchStatus = "filling" | "full" | "labelled" | "in_transit" | "received" | "rejected";

export interface ShippingChecklist {
  enoughIce: boolean;
  closedContainer: boolean;
  labelAttached: boolean;
  courier: string;
}

export interface Batch {
  id: string;
  code: string;
  orderId: string;
  status: BatchStatus;
  fillDeadline: string;
  labelledAt: string | null;
  departedAt: string | null;
  checklist: ShippingChecklist | null;
}

export interface BatchItem {
  batchId: string;
  landingId: string;
  kg: number;
}

export type ReceiptDecision = "accept_all" | "accept_partial" | "reject";

export interface Receipt {
  batchId: string;
  decision: ReceiptDecision;
  acceptedKg: number;
  recheckScore: number | null;
  reason: string | null;
  note: string | null;
  receivedAt: string;
}

export type PaymentStatus = "down_payment" | "paid" | "late";

export interface Payment {
  batchId: string;
  amount: number;
  dueAt: string;
  paidAt: string | null;
  status: PaymentStatus;
}

export type LedgerEntryKind = "income" | "loan" | "installment";

export interface LedgerEntry {
  id: string;
  fisherId: string;
  kind: LedgerEntryKind;
  amount: number;
  counterparty: string;
  note: string;
  date: string;
  batchId: string | null;
  approval: DeductionStatus | null;
}

export interface ProcessingMaterial {
  id: string;
  landingId: string;
  kg: number;
  pricePerKg: number;
  takenByProducerId: string | null;
  takenAt: string | null;
}

export interface ProductCaptions {
  whatsappStatus: string;
  marketplace: string;
  instagram: string;
}

export interface Product {
  id: string;
  producerId: string;
  materialId: string | null;
  name: string;
  brand: string;
  spokenDescription: string;
  run: ProductionRun;
  marginRate: number;
  label: LabelDraft;
  captions: ProductCaptions;
}

export interface Producer {
  id: string;
  name: string;
  address: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  entity: string;
  detail: string;
}

export interface DemoDatabase {
  schemaVersion: number;
  kub: Kub;
  fishers: Fisher[];
  species: FishSpecies[];
  buyers: Buyer[];
  producers: Producer[];
  referencePrices: ReferencePrice[];
  landings: Landing[];
  gradings: Grading[];
  orders: Order[];
  batches: Batch[];
  batchItems: BatchItem[];
  receipts: Receipt[];
  payments: Payment[];
  ledger: LedgerEntry[];
  materials: ProcessingMaterial[];
  products: Product[];
  auditLog: AuditEntry[];
}
