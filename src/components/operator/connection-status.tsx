"use client";

import { useSyncExternalStore } from "react";
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
  return online ? (
    <Pill tone="success" dot className={className}>
      Ada sinyal · semua terkirim
    </Pill>
  ) : (
    <Pill tone="warning" icon="savedOnDevice" className={className}>
      Tanpa sinyal · tersimpan di HP
    </Pill>
  );
}
