"use client";

import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choices";
import { Sheet } from "@/components/ui/overlays";
import { Avatar, Card, Notice } from "@/components/ui/surface";
import type { FisherDebt } from "@/data/queries/fishers";
import type { Fisher, LedgerEntry } from "@/data/types";
import type { DeductionStatus } from "@/domain/revenue-share";
import { formatRupiah, formatShortDayDate } from "@/lib/format";

const APPROVAL_LABEL: Record<DeductionStatus, string> = {
  pending: "menunggu persetujuan",
  approved_by_link: "setuju lewat tautan",
  approved_verbally: "setuju lisan",
  declined: "ditolak",
};

function approvalLinkText(fisher: Fisher, entry: LedgerEntry, origin: string): string {
  return `Pak ${fisher.name}, ada permintaan cicilan ${formatRupiah(entry.amount)} ke ${entry.counterparty} dari uang pesanan. Setujui atau tolak di sini: ${origin}/nelayan`;
}

function HistoryRow({ entry, awaitingPayment }: { entry: LedgerEntry; awaitingPayment: boolean }) {
  const isLoan = entry.kind === "loan";
  return (
    <li className="flex items-start gap-3 border-t border-line py-2.5">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="font-semibold">{entry.note}</span>
        <span className="text-[0.9375rem] text-ink-2">
          {formatShortDayDate(entry.date)}
          {entry.approval ? ` · ${APPROVAL_LABEL[entry.approval]}` : ""}
          {awaitingPayment ? " · dipotong saat pembeli membayar" : ""}
        </span>
      </div>
      <span className={isLoan ? "tabular font-bold" : entry.approval === "declined" ? "tabular text-ink-3 line-through" : "tabular font-bold"}>
        {isLoan ? formatRupiah(entry.amount) : `− ${formatRupiah(entry.amount)}`}
      </span>
    </li>
  );
}

export function DebtCard({
  debt,
  history,
  onAnswerVerbally,
}: {
  debt: FisherDebt;
  history: LedgerEntry[];
  onAnswerVerbally: (entry: LedgerEntry) => void;
}) {
  const { fisher, summary } = debt;
  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Avatar initials={fisher.initials} />
        <span className="type-h3">Pak {fisher.name}</span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-ink-2">Sisa utang</span>
        <span className="type-num-xl">{formatRupiah(summary.outstanding)}</span>
        {summary.lenders.map((lender) => (
          <span key={lender.lender} className="text-ink-2">
            ke {lender.lender} · pinjaman awal {formatRupiah(lender.principal)} · sudah dicicil {formatRupiah(lender.repaid)}
          </span>
        ))}
      </div>
      {summary.pending.map((entry) => (
        <Notice key={entry.id} tone="warning" icon="hand" title={`Menunggu persetujuan Pak ${fisher.name}`}>
          <div className="flex flex-col gap-3">
            <p>
              Cicilan {formatRupiah(entry.amount)} ke {entry.counterparty}. {entry.note}.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                size="md"
                icon="send"
                onClick={() =>
                  window.open(
                    `https://wa.me/?text=${encodeURIComponent(approvalLinkText(fisher, entry, window.location.origin))}`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              >
                Kirim tautan persetujuan
              </Button>
              <Button variant="quiet" size="md" icon="chat" onClick={() => onAnswerVerbally(entry)}>
                Catat jawaban lisan
              </Button>
            </div>
          </div>
        </Notice>
      ))}
      {history.length > 0 && (
        <details className="group">
          <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between font-bold [&::-webkit-details-marker]:hidden">
            Riwayat ({history.length})
            <Icon name="chevronDown" size={20} className="text-ink-2 transition-transform group-open:rotate-180" />
          </summary>
          <ul>
            {history.map((entry) => (
              <HistoryRow key={entry.id} entry={entry} awaitingPayment={summary.scheduled.includes(entry)} />
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}

export function VerbalAnswerSheet({
  open,
  onOpenChange,
  fisher,
  entry,
  busy,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fisher: Fisher | null;
  entry: LedgerEntry | null;
  busy: boolean;
  onSave: (approve: boolean) => void;
}) {
  const [answer, setAnswer] = useState<"approve" | "decline" | null>(null);
  if (!fisher || !entry) {
    return null;
  }
  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={`Jawaban Pak ${fisher.name}`}
      description={`Cicilan ${formatRupiah(entry.amount)} ke ${entry.counterparty}. ${entry.note}.`}
      footer={
        <div className="flex flex-col gap-2 pb-1">
          {!answer && <p className="text-center font-semibold text-ink-2">Pilih jawaban Pak {fisher.name} dulu</p>}
          <Button size="xl" block busy={busy} disabled={!answer || busy} onClick={() => answer && onSave(answer === "approve")}>
            Simpan jawaban
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-2">
        <ChoiceGroup
          legend={`Pak ${fisher.name} menjawab`}
          value={answer}
          onChange={setAnswer}
          columns={1}
          options={[
            { value: "approve", title: "Setuju dipotong", description: `${formatRupiah(entry.amount)} dipotong dari bagi hasil` },
            { value: "decline", title: "Tidak setuju", description: "Bagi hasil dibayar penuh. Utang tetap tercatat." },
          ]}
        />
        <p className="flex items-start gap-2 leading-snug text-ink-2">
          <Icon name="ledger" size={20} className="mt-0.5 shrink-0" />
          Pastikan Pak {fisher.name} sendiri yang menjawab. Jawaban dicatat dengan nama operator dan waktunya.
        </p>
      </div>
    </Sheet>
  );
}
