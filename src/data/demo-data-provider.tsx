"use client";

import {
  createContext,
  use,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEMO_START } from "./demo-clock";
import {
  createLocalDemoRepository,
  seedSnapshotOnce,
  type LocalDemoRepository,
} from "./local-demo-repository";
import type { NelayankuRepository } from "./repository";
import type { DemoDatabase } from "./types";

const CLOCK_TICK_MS = 15_000;

interface DemoRuntime {
  repository: LocalDemoRepository;
  subscribeToClock(listener: () => void): () => void;
  clockSnapshot(): Date;
}

const RuntimeContext = createContext<DemoRuntime | null>(null);

let browserRuntime: DemoRuntime | null = null;

function browserStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function createRuntime(): DemoRuntime {
  const repository = createLocalDemoRepository({
    storage: browserStorage(),
    actor: () => "Operator demo",
  });
  const clockListeners = new Set<() => void>();
  let current = DEMO_START;
  let timer: number | null = null;
  const tick = () => {
    current = repository.isHydrated() ? repository.now() : DEMO_START;
    clockListeners.forEach((listener) => listener());
  };
  repository.subscribe(tick);
  return {
    repository,
    subscribeToClock(listener) {
      clockListeners.add(listener);
      timer ??= window.setInterval(tick, CLOCK_TICK_MS);
      return () => {
        clockListeners.delete(listener);
        if (clockListeners.size === 0 && timer !== null) {
          window.clearInterval(timer);
          timer = null;
        }
      };
    },
    clockSnapshot: () => current,
  };
}

function runtimeForBrowser(): DemoRuntime {
  if (typeof window === "undefined") {
    return createRuntime();
  }
  browserRuntime ??= createRuntime();
  return browserRuntime;
}

const noSubscription = () => () => undefined;
const serverClock = () => DEMO_START;
const notHydrated = () => false;

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [runtime] = useState(runtimeForBrowser);
  useEffect(() => {
    if (!runtime.repository.isHydrated()) {
      runtime.repository.hydrate();
    }
    const refresh = (event: StorageEvent) => {
      if (event.key?.startsWith("nelayanku.demo."))
        runtime.repository.hydrate();
    };
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, [runtime]);
  return <RuntimeContext value={runtime}>{children}</RuntimeContext>;
}

function useRuntime(): DemoRuntime | null {
  return use(RuntimeContext);
}

export function useRepository(): NelayankuRepository {
  const runtime = useRuntime();
  if (!runtime) {
    throw new Error("useRepository must be used inside DemoDataProvider");
  }
  return runtime.repository;
}

export function useDemoDatabase(): DemoDatabase {
  const runtime = useRuntime();
  return useSyncExternalStore(
    runtime?.repository.subscribe ?? noSubscription,
    runtime?.repository.getSnapshot ?? seedSnapshotOnce,
    seedSnapshotOnce,
  );
}

export function useDemoHydrated(): boolean {
  const runtime = useRuntime();
  return useSyncExternalStore(
    runtime?.repository.subscribe ?? noSubscription,
    runtime?.repository.isHydrated ?? notHydrated,
    notHydrated,
  );
}

export function useDemoNow(): Date {
  const runtime = useRuntime();
  return useSyncExternalStore(
    runtime?.subscribeToClock ?? noSubscription,
    runtime?.clockSnapshot ?? serverClock,
    serverClock,
  );
}

const serverStorageStatus = () => "persistent" as const;

export function useDemoStorageStatus(): "persistent" | "memory" {
  const runtime = useRuntime();
  return useSyncExternalStore(
    runtime?.repository.subscribe ?? noSubscription,
    runtime?.repository.getStorageStatus ?? serverStorageStatus,
    serverStorageStatus,
  );
}
