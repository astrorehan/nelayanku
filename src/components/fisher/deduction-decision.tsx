"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import type { LenderBalance } from "@/data/queries/fishers";
import type { LedgerEntry } from "@/data/types";
import { formatRupiah } from "@/lib/format";

export function DeductionDecision({
  entry,
  lender,
  busy,
  onDecide,
}: {
  entry: LedgerEntry;
  lender: LenderBalance | undefined;
  busy: boolean;
  onDecide: (approve: boolean) => void;
}) {
  const [changing, setChanging] = useState(false);
  const outstandingAfter = (lender?.outstanding ?? 0) - entry.amount;
  const decided = entry.approval !== "pending" && entry.approval !== null;
  const approved = entry.approval === "approved_by_link" || entry.approval === "approved_verbally";
  const decide = (approve: boolean) => {
    onDecide(approve);
    setChanging(false);
  };

  if (decided && !changing) {
    return (
      <Card tone={approved ? "surface" : "paper"} emphasis className="flex flex-col gap-3 p-5">
        <p className="flex items-center gap-2.5 type-h2">
          <span className="grid size-8 place-items-center rounded-full bg-success text-white">
            <Icon name="check" size={18} strokeWidth={3} />
          </span>
          {approved ? "Potongan disetujui" : "Tidak ada potongan"}
        </p>
        <p className="type-lead text-ink-2">
          {approved
            ? `${formatRupiah(entry.amount)} dipotong saat uang pesanan dibayar. Sisa pinjaman jadi ${formatRupiah(outstandingAfter)}.`
            : `Uang dari pesanan masuk utuh. ${entry.counterparty} dan operator KUB sudah diberi tahu.`}
        </p>
        <Button variant="quiet" size="lg" className="self-start" onClick={() => setChanging(true)}>
          Ubah keputusan
        </Button>
      </Card>
    );
  }

  return (
    <Card emphasis className="flex flex-col gap-4 p-5">
      <div className="flex flex-col gap-1">
        <h2 className="type-h2">{entry.counterparty} minta cicilan</h2>
        <p className="type-figure-hero">{formatRupiah(entry.amount)}</p>
        <p className="type-lead text-ink-2">{entry.note.replace(/^cicilan\s+/i, "")}</p>
      </div>
      <ul className="flex flex-col gap-2 rounded-[14px] bg-paper-deep p-4 text-[1.0625rem] leading-snug">
        <li>
          <b>Kalau setuju:</b> sisa pinjaman jadi {formatRupiah(outstandingAfter)}.
        </li>
        <li>
          <b>Kalau tidak:</b> uang dari pesanan masuk utuh.
        </li>
      </ul>
      <div className="grid grid-cols-2 gap-2.5">
        <Button variant="secondary" size="xl" disabled={busy} onClick={() => decide(true)}>
          Setuju
        </Button>
        <Button variant="secondary" size="xl" disabled={busy} onClick={() => decide(false)}>
          Tidak setuju
        </Button>
      </div>
      <p className="text-[0.9375rem] leading-snug text-ink-2">Keputusan Bapak dicatat dengan waktunya. Bisa diubah sebelum uang pesanan dibayar.</p>
    </Card>
  );
}
