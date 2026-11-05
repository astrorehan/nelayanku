import type { NewGrading, NewLanding, NewOrder, RoutingResult } from "./commands";
import type { Grade } from "@/domain/grade";
import type {
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
} from "./types";

export interface NelayankuRepository {
  getSnapshot(): DemoDatabase;
  subscribe(listener: () => void): () => void;
  now(): Date;
  recordLanding(input: NewLanding): Promise<Landing>;
  saveGrading(input: NewGrading): Promise<Grading>;
  overrideGrade(input: { landingId: string; grade: Grade; reason: string }): Promise<Grading>;
  routeLanding(input: { landingId: string; destination: LandingDestination; batchId?: string }): Promise<RoutingResult>;
  labelBatch(batchId: string): Promise<Batch>;
  departBatch(input: { batchId: string; checklist: ShippingChecklist }): Promise<Batch>;
  cancelUnfilledBatch(batchId: string): Promise<Batch>;
  receiveBatch(input: {
    batchId: string;
    decision: ReceiptDecision;
    acceptedKg: number;
    reason: string | null;
    note: string | null;
    recheckScore: number | null;
  }): Promise<Receipt>;
  decideDeduction(input: { entryId: string; approve: boolean; via: "link" | "verbal" }): Promise<LedgerEntry>;
  placeOrder(input: NewOrder): Promise<Order>;
  takeMaterial(input: { materialId: string; producerId: string }): Promise<void>;
  saveProduct(product: Product): Promise<Product>;
  resetDemo(): Promise<void>;
}
