import { describe, expect, it } from "vitest";
import { DEMO_START } from "./demo-clock";
import {
  createLocalDemoRepository,
  DATABASE_STORAGE_KEY,
  type KeyValueStorage,
} from "./local-demo-repository";

function memoryStorage(): KeyValueStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
    removeItem: (key) => void values.delete(key),
  };
}

function repository(storage: KeyValueStorage, realNow: () => number) {
  let counter = 0;
  return createLocalDemoRepository({
    storage,
    actor: () => "Bu Sari",
    realNow,
    newId: (prefix) => `${prefix}-${++counter}`,
  });
}

describe("local demo repository", () => {
  it("starts the demo clock at 05.41 and lets it run with real time", () => {
    let real = 1_000_000;
    const repo = repository(memoryStorage(), () => real);
    repo.hydrate();
    expect(repo.now().toISOString()).toBe(DEMO_START.toISOString());
    real += 10 * 60_000;
    expect(repo.now().getTime() - DEMO_START.getTime()).toBe(10 * 60_000);
  });

  it("persists changes and restores them on the next visit", async () => {
    const storage = memoryStorage();
    const first = repository(storage, () => 1);
    first.hydrate();
    const landing = await first.recordLanding({
      fisherId: "nelayan-darman",
      speciesId: "tongkol",
      weightKg: 18,
      iced: true,
    });

    const second = repository(storage, () => 2);
    second.hydrate();
    expect(
      second
        .getSnapshot()
        .landings.some((candidate) => candidate.id === landing.id),
    ).toBe(true);
  });

  it("notifies subscribers after every change", async () => {
    const repo = repository(memoryStorage(), () => 1);
    repo.hydrate();
    let calls = 0;
    const unsubscribe = repo.subscribe(() => calls++);
    await repo.recordLanding({
      fisherId: "nelayan-darman",
      speciesId: "tongkol",
      weightKg: 5,
      iced: true,
    });
    unsubscribe();
    await repo.recordLanding({
      fisherId: "nelayan-darman",
      speciesId: "tongkol",
      weightKg: 5,
      iced: true,
    });
    expect(calls).toBe(1);
  });

  it("returns to the seed story on reset", async () => {
    const storage = memoryStorage();
    const repo = repository(storage, () => 1);
    repo.hydrate();
    const seedCount = repo.getSnapshot().landings.length;
    await repo.recordLanding({
      fisherId: "nelayan-darman",
      speciesId: "tongkol",
      weightKg: 5,
      iced: true,
    });
    await repo.resetDemo();
    expect(repo.getSnapshot().landings).toHaveLength(seedCount);
    expect(storage.values.has(DATABASE_STORAGE_KEY)).toBe(false);
  });

  it("ignores stored data from an older schema", () => {
    const storage = memoryStorage();
    storage.setItem(
      DATABASE_STORAGE_KEY,
      JSON.stringify({ schemaVersion: -1, landings: [] }),
    );
    const repo = repository(storage, () => 1);
    repo.hydrate();
    expect(repo.getSnapshot().landings.length).toBeGreaterThan(0);
  });

  it("keeps working when storage throws, as in private browsing", () => {
    const broken: KeyValueStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    const repo = repository(broken, () => 1);
    expect(() => repo.hydrate()).not.toThrow();
    expect(repo.getSnapshot().landings.length).toBeGreaterThan(0);
  });
});

it("reports quota failures instead of claiming an in-memory change was saved", async () => {
  const repo = createLocalDemoRepository({
    storage: {
      getItem: () => null,
      removeItem: () => undefined,
      setItem: () => {
        throw new Error("quota");
      },
    },
    actor: () => "Bu Sari",
    realNow: () => 1,
    newId: () => "darat-kuota",
  });
  repo.hydrate();
  await repo.recordLanding({
    fisherId: "nelayan-darman",
    speciesId: "tongkol",
    weightKg: 18,
    iced: true,
  });
  expect(repo.getStorageStatus()).toBe("memory");
  expect(
    repo.getSnapshot().landings.some((item) => item.id === "darat-kuota"),
  ).toBe(true);
});

it("observes a reset from another tab when rehydrating after a storage event", async () => {
  const storage = memoryStorage();
  const first = repository(storage, () => 1);
  const second = repository(storage, () => 1);
  first.hydrate();
  await first.recordLanding({
    fisherId: "nelayan-darman",
    speciesId: "tongkol",
    weightKg: 5,
    iced: true,
  });
  second.hydrate();
  const count = second.getSnapshot().landings.length;
  await first.resetDemo();
  second.hydrate();
  expect(second.getSnapshot().landings.length).toBe(count - 1);
});
