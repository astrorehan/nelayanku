import type { DemoDatabase } from "../types";
import { BUYERS, FISHERS, KUB, PRODUCERS, SPECIES } from "./catalog";
import { createHistory } from "./history";
import { SEED_PRODUCTS } from "./products";
import { createReferencePrices } from "./reference-prices";
import { createTodayScenario } from "./today";

export const SCHEMA_VERSION = 2;

export function createSeedDatabase(): DemoDatabase {
  const referencePrices = createReferencePrices();
  const history = createHistory(referencePrices);
  const today = createTodayScenario(referencePrices);
  return {
    schemaVersion: SCHEMA_VERSION,
    kub: KUB,
    fishers: FISHERS,
    species: SPECIES,
    buyers: BUYERS,
    producers: PRODUCERS,
    referencePrices,
    landings: [...history.landings, ...today.landings],
    gradings: [...history.gradings, ...today.gradings],
    orders: [...history.orders, ...today.orders],
    batches: [...history.batches, ...today.batches],
    batchItems: [...history.batchItems, ...today.batchItems],
    receipts: history.receipts,
    payments: history.payments,
    ledger: [...history.ledger, ...today.ledger],
    materials: [...history.materials, ...today.materials],
    products: SEED_PRODUCTS,
    auditLog: [],
  };
}
