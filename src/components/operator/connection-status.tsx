"use client";

import { useSyncExternalStore } from "react";
import { useDemoStorageStatus } from "@/data/demo-data-provider";
import { Pill } from "@/components/ui/surface";

function subscribe(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

export function useOnline() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

export function ConnectionStatus({ className }: { className?: string }) {
  const online = useOnline();
  const storage = useDemoStorageStatus();
  if (storage === "memory")
    return (
      <Pill tone="warning" icon="warning" className={className}>
        Belum tersimpan · jangan tutup halaman
      </Pill>
    );
  return online ? (
    <Pill tone="success" dot className={className}>
      Tersimpan di perangkat · demo
    </Pill>
  ) : (
    <Pill tone="warning" icon="savedOnDevice" className={className}>
      Tanpa sinyal · tersimpan di HP
    </Pill>
  );
}
