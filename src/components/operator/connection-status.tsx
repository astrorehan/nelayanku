"use client";

import clsx from "clsx";
import { useSyncExternalStore } from "react";
import { useDemoStorageStatus } from "@/data/demo-data-provider";

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
  const message =
    storage === "memory"
      ? "Belum tersimpan · jangan tutup halaman"
      : online
        ? "Tersimpan di perangkat · demo"
        : "Tanpa sinyal · tersimpan di HP";
  return (
    <p
      className={clsx(
        "flex items-center gap-2 text-sm",
        storage === "memory" || !online ? "text-warning-ink" : "text-ink-2",
        className,
      )}
    >
      <span
        aria-hidden
        className={clsx(
          "size-1.5 shrink-0 rounded-full",
          storage === "memory" || !online ? "bg-warning-ink" : "bg-ink-2",
        )}
      />
      {message}
    </p>
  );
}
