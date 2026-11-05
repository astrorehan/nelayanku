import * as commands from "./commands";
import { demoNowFrom } from "./demo-clock";
import type { NelayankuRepository } from "./repository";
import { createSeedDatabase, SCHEMA_VERSION } from "./seed";
import type { DemoDatabase } from "./types";

export const DATABASE_STORAGE_KEY = "nelayanku.demo.database";
export const SESSION_STORAGE_KEY = "nelayanku.demo.sessionStartedAt";

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface LocalDemoRepository extends NelayankuRepository {
  hydrate(): void;
  isHydrated(): boolean;
}

let seedSnapshot: DemoDatabase | null = null;

export function seedSnapshotOnce(): DemoDatabase {
  seedSnapshot ??= createSeedDatabase();
  return seedSnapshot;
}

function safely<T>(action: () => T, fallback: T): T {
  try {
    return action();
  } catch {
    return fallback;
  }
}

export function createLocalDemoRepository(options: {
  storage: KeyValueStorage | null;
  actor: () => string;
  realNow?: () => number;
  newId?: (prefix: string) => string;
}): LocalDemoRepository {
  const realNow = options.realNow ?? (() => Date.now());
  const newId =
    options.newId ?? ((prefix: string) => `${prefix}-${globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 10)}`);
  let db = seedSnapshotOnce();
  let sessionStartedAt: number | null = null;
  let hydrated = false;
  const listeners = new Set<() => void>();

  const notify = () => listeners.forEach((listener) => listener());

  const persist = () => {
    if (!options.storage) {
      return;
    }
    safely(() => options.storage!.setItem(DATABASE_STORAGE_KEY, JSON.stringify(db)), undefined);
  };

  const now = () => demoNowFrom(sessionStartedAt ?? realNow(), realNow());

  async function run<I, R>(
    command: (state: DemoDatabase, input: I, ctx: commands.CommandContext) => commands.CommandResult<R>,
    input: I,
  ): Promise<R> {
    const { db: next, result } = command(db, input, { now: now(), actor: options.actor(), newId });
    db = next;
    persist();
    notify();
    return result;
  }

  return {
    getSnapshot: () => db,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    now,
    hydrate() {
      const storage = options.storage;
      const storedStart = storage ? Number(safely(() => storage.getItem(SESSION_STORAGE_KEY), null)) : NaN;
      if (Number.isFinite(storedStart) && storedStart > 0) {
        sessionStartedAt = storedStart;
      } else {
        sessionStartedAt = realNow();
        safely(() => storage?.setItem(SESSION_STORAGE_KEY, String(sessionStartedAt)), undefined);
      }
      const stored = storage ? safely(() => storage.getItem(DATABASE_STORAGE_KEY), null) : null;
      const parsed = stored ? safely<DemoDatabase | null>(() => JSON.parse(stored), null) : null;
      if (parsed && parsed.schemaVersion === SCHEMA_VERSION) {
        db = parsed;
      }
      hydrated = true;
      notify();
    },
    isHydrated: () => hydrated,
    recordLanding: (input) => run(commands.recordLanding, input),
    saveGrading: (input) => run(commands.saveGrading, input),
    overrideGrade: (input) => run(commands.overrideGrade, input),
    routeLanding: (input) => run(commands.routeLanding, input),
    labelBatch: (batchId) => run(commands.labelBatch, { batchId }),
    departBatch: (input) => run(commands.departBatch, input),
    cancelUnfilledBatch: (batchId) => run(commands.cancelUnfilledBatch, { batchId }),
    receiveBatch: (input) => run(commands.receiveBatch, input),
    decideDeduction: (input) => run(commands.decideDeduction, input),
    placeOrder: (input) => run(commands.placeOrder, input),
    takeMaterial: (input) => run(commands.takeMaterial, input),
    saveProduct: (product) => run(commands.saveProduct, product),
    async resetDemo() {
      db = seedSnapshotOnce();
      sessionStartedAt = realNow();
      safely(() => options.storage?.removeItem(DATABASE_STORAGE_KEY), undefined);
      safely(() => options.storage?.setItem(SESSION_STORAGE_KEY, String(sessionStartedAt)), undefined);
      notify();
    },
  };
}
