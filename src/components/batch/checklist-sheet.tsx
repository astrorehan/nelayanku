"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckChoice } from "@/components/ui/choices";
import { TextField } from "@/components/ui/fields";
import { Sheet } from "@/components/ui/overlays";
import type { BatchView } from "@/data/queries/batches";
import type { ShippingChecklist } from "@/data/types";
import { formatClock, formatKg } from "@/lib/format";

function checklistHint(checks: boolean[], courier: string): string | null {
  if (checks.some((checked) => !checked)) {
    return "Centang semua dulu";
  }
  return courier.trim() ? null : "Isi nama kurir dulu";
}

export function ChecklistSheet({
  open,
  onOpenChange,
  view,
  recentCouriers,
  busy,
  onDepart,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  view: BatchView;
  recentCouriers: string[];
  busy: boolean;
  onDepart: (checklist: ShippingChecklist) => void;
}) {
  const [enoughIce, setEnoughIce] = useState(false);
  const [closedContainer, setClosedContainer] = useState(false);
  const [labelAttached, setLabelAttached] = useState(false);
  const [courier, setCourier] = useState("");
  const hint = checklistHint([enoughIce, closedContainer, labelAttached], courier);

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title="Siap berangkat?"
      description={`Pesanan ${view.species.name} ${view.order.minimumGrade} · ${formatKg(view.filledKg)} · kirim ${formatClock(view.order.deliverAt)}`}
      footer={
        <div className="flex flex-col gap-2 pb-1">
          {hint && (
            <p aria-live="polite" className="text-center font-semibold text-ink-2">
              {hint}
            </p>
          )}
          <Button
            size="xl"
            block
            icon="courier"
            busy={busy}
            disabled={hint !== null || busy}
            onClick={() => onDepart({ enoughIce, closedContainer, labelAttached, courier: courier.trim() })}
          >
            Berangkat sekarang
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 pb-2">
        <CheckChoice checked={enoughIce} onChange={setEnoughIce} title="Es cukup" description="Perbandingan es dan ikan 1 : 1" />
        <CheckChoice checked={closedContainer} onChange={setClosedContainer} title="Wadah tertutup" description="Cool box atau tong berpenutup" />
        <CheckChoice checked={labelAttached} onChange={setLabelAttached} title="Label tertempel" description="QR terlihat dari luar" />
        <TextField
          label="Kurir"
          placeholder="Nama dan kendaraan, misalnya Pak Udin · motor box"
          value={courier}
          onChange={(event) => setCourier(event.target.value)}
          className="pt-2"
        />
        {recentCouriers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ink-2">Terakhir:</span>
            {recentCouriers.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => setCourier(name)}
                aria-pressed={courier === name}
                className="min-h-11 rounded-full border border-line-strong bg-surface px-4 font-semibold hover:border-ink aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-paper"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  );
}
