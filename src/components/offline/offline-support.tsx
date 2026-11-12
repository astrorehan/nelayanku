"use client";

import { useDemoStorageStatus } from "@/data/demo-data-provider";
import { Notice } from "@/components/ui/surface";
import { useEffect } from "react";

export function OfflineSupport() {
  const storage = useDemoStorageStatus();
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    const timer = window.setTimeout(() => {
      void navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .catch(() => undefined);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, []);
  return storage === "memory" ? (
    <div className="p-4">
      <Notice tone="warning" title="Catatan belum tersimpan di perangkat">
        Ruang simpan tidak tersedia atau penuh. Jangan tutup halaman sebelum
        menyalin atau mengunduh catatan yang diperlukan.
      </Notice>
    </div>
  ) : null;
}
