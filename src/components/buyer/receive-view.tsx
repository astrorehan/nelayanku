"use client";

import Image from "next/image";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { RoleHeader } from "@/components/layout/role-header";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choices";
import { TextArea, TextField } from "@/components/ui/fields";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, Notice } from "@/components/ui/surface";
import { useDemoDatabase, useDemoHydrated, useDemoNow, useRepository } from "@/data/demo-data-provider";
import { DEMO_BUYER_ID } from "@/data/demo-identities";
import { batchViewByCode, type BatchView } from "@/data/queries/batches";
import type { ReceiptDecision } from "@/data/types";
import { formatClock, formatDecimal, formatKg, formatRupiah, formatScore } from "@/lib/format";
import { RecheckSheet } from "./recheck-sheet";

const REJECTION_REASONS = ["Bau tidak segar", "Daging lunak", "Es habis", "Berat kurang"] as const;
type RejectionReason = (typeof REJECTION_REASONS)[number];

function parseKg(text: string): number {
  const value = Number(text.replace(",", "."));
  return Number.isFinite(value) ? value : 0;
}

function EvidencePhoto({ photoUrl, onPhoto }: { photoUrl: string | null; onPhoto: (url: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold">Foto bukti</p>
      <div className="flex items-center gap-3">
        {photoUrl && (
          <span className="relative size-20 overflow-hidden rounded-[12px] border border-line bg-paper-deep">
            <Image src={photoUrl} alt="Foto bukti penolakan" fill sizes="80px" unoptimized className="object-cover" />
          </span>
        )}
        <label className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-[12px] border border-line-strong bg-surface px-4 font-bold hover:border-ink has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                onPhoto(URL.createObjectURL(file));
              }
            }}
          />
          <Icon name="camera" size={20} />
          {photoUrl ? "Ganti foto" : "Tambah foto"}
        </label>
      </div>
    </div>
  );
}

function ShipmentSummary({ view }: { view: BatchView }) {
  const landedTimes = view.contributions.map((contribution) => contribution.landing.landedAt).sort();
  const firstLanded = landedTimes[0];
  const lastLanded = landedTimes[landedTimes.length - 1];
  return (
    <Card className="flex items-center gap-4 p-4 sm:p-5">
      {view.batchGrade && <GradeStamp grade={view.batchGrade} size="md" />}
      <div className="flex min-w-0 flex-col">
        <span className="type-h3">
          {view.species.name} · {formatKg(view.filledKg)}
        </span>
        <span className="text-ink-2">
          {view.averageScore !== null ? `Skor ${formatScore(view.averageScore)}` : ""} · {view.allIced ? "pakai es" : "ada yang tanpa es"}
        </span>
        {firstLanded && (
          <span className="text-ink-2">
            Darat {formatClock(firstLanded)}
            {lastLanded !== firstLanded ? `–${formatClock(lastLanded)}` : ""}
          </span>
        )}
      </div>
    </Card>
  );
}

function ReceivedResult({ view }: { view: BatchView }) {
  const receipt = view.receipt!;
  const rejected = receipt.decision === "reject";
  return (
    <Card emphasis className="flex flex-col gap-4 p-6">
      <p className="flex items-center gap-3 type-h2">
        <span className={rejected ? "grid size-9 place-items-center rounded-full bg-danger text-white" : "grid size-9 place-items-center rounded-full bg-success text-white"}>
          <Icon name={rejected ? "close" : "check"} size={20} strokeWidth={3} />
        </span>
        {rejected ? "Penolakan terkirim" : `Diterima ${formatKg(receipt.acceptedKg)}`}
      </p>
      <p className="type-lead text-ink-2">
        {rejected
          ? "Masuk ke antrean sengketa KUB, lengkap dengan foto, alasan, dan skor cek ulang."
          : `Pembayaran ${formatRupiah(view.payment?.amount ?? receipt.acceptedKg * view.order.pricePerKg)} dilunasi (simulasi). Bagi hasil ke nelayan dihitung otomatis.`}
      </p>
      {receipt.recheckScore !== null && <p className="text-ink-2">Skor cek ulang Anda: {formatScore(receipt.recheckScore)}</p>}
      <div className="flex flex-col gap-2 sm:flex-row">
        <ButtonLink href="/pembeli" size="lg" icon="arrowLeft">
          Ke halaman Pesanan
        </ButtonLink>
        <ButtonLink href={`/lacak/${view.batch.code}`} variant="quiet" size="lg" icon="shield">
          Lihat bukti mutu
        </ButtonLink>
      </div>
    </Card>
  );
}

export function ReceiveView({ code }: { code: string }) {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const now = useDemoNow();
  const repository = useRepository();
  const [decision, setDecision] = useState<ReceiptDecision | null>(null);
  const [acceptedText, setAcceptedText] = useState("");
  const [reason, setReason] = useState<RejectionReason | null>(null);
  const [note, setNote] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [recheckScore, setRecheckScore] = useState<number | null>(null);
  const [recheckOpen, setRecheckOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const buyer = db.buyers.find((candidate) => candidate.id === DEMO_BUYER_ID)!;
  const header = <RoleHeader title={buyer.name} subtitle={`${buyer.contactName} · pembeli`} currentRole="Pembeli" width="wide" />;

  if (!hydrated) {
    return (
      <>
        {header}
        <main className="mx-auto w-full max-w-2xl px-4 pt-6 sm:px-6">
          <p className="flex items-center gap-2 font-semibold text-ink-2">
            <Icon name="sync" size={20} className="animate-spin" />
            Memuat kiriman…
          </p>
        </main>
      </>
    );
  }

  const view = batchViewByCode(db, code, now);
  const backLink = (
    <ButtonLink href="/pembeli" variant="ghost" size="md" icon="chevronLeft" className="-ml-3 self-start">
      Pesanan
    </ButtonLink>
  );

  if (!view || view.buyer.id !== buyer.id) {
    return (
      <>
        {header}
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-4 sm:px-6">
          {backLink}
          <Notice tone="warning" title="Kiriman tidak ditemukan">
            Periksa kode di label, misalnya TGK-A-0511.
          </Notice>
        </main>
      </>
    );
  }

  const shippedKg = view.filledKg;
  const acceptedKg = decision === "accept_all" ? shippedKg : decision === "reject" ? 0 : parseKg(acceptedText);
  const needsEvidence = decision === "accept_partial" || decision === "reject";
  const hint =
    decision === null
      ? "Pilih keputusan dulu"
      : decision === "accept_partial" && (acceptedKg <= 0 || acceptedKg >= shippedKg)
        ? `Isi berat yang diterima, kurang dari ${formatKg(shippedKg)}`
        : needsEvidence && !reason
          ? "Pilih alasan dulu"
          : needsEvidence && !photoUrl
            ? "Tambah foto bukti dulu"
            : null;

  const submit = async () => {
    if (hint || !decision) {
      return;
    }
    setBusy(true);
    setFailure(null);
    try {
      await repository.receiveBatch({
        batchId: view.batch.id,
        decision,
        acceptedKg,
        reason: needsEvidence ? reason : null,
        note: note.trim() || null,
        recheckScore,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setFailure("Belum tersimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const primaryLabel =
    decision === "reject" ? "Kirim penolakan" : decision === "accept_partial" && acceptedKg > 0 ? `Terima ${formatKg(acceptedKg)}` : `Terima ${formatKg(shippedKg)}`;

  return (
    <>
      {header}
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-5 px-4 pb-32 pt-4 sm:px-6">
        {backLink}
        <div className="flex flex-col gap-1">
          <h1 className="type-h1">Terima kiriman</h1>
          <p className="text-ink-2">
            <span className="type-code text-ink">{view.batch.code}</span> · dari {db.kub.name}
          </p>
        </div>
        <ShipmentSummary view={view} />

        {view.receipt ? (
          <ReceivedResult view={view} />
        ) : view.batch.status !== "in_transit" ? (
          <Notice tone="info" title="Kiriman ini belum berangkat">
            {view.batch.status === "cancelled" ? "Pesanan ini dibatalkan KUB." : `Dijadwalkan tiba ${formatClock(view.order.deliverAt)}. Halaman ini aktif setelah kiriman berangkat.`}
          </Notice>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setRecheckOpen(true)}
              className="flex min-h-16 items-center gap-3 rounded-[16px] border border-line bg-surface px-4 py-3 text-left hover:border-ink"
            >
              <Icon name="scan" size={24} className="shrink-0" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-bold">Cek ulang 1 ikan</span>
                <span className="text-ink-2">
                  {recheckScore !== null ? `Skor cek ulang ${formatScore(recheckScore)}` : "Boleh dilewati. Hasilnya ikut tercatat."}
                </span>
              </span>
              <Icon name="chevronRight" size={22} className="shrink-0 text-ink-2" />
            </button>

            <ChoiceGroup
              legend="Keputusan"
              value={decision}
              onChange={setDecision}
              columns={1}
              options={[
                { value: "accept_all", title: "Terima semua", description: `${formatKg(shippedKg)} sesuai pesanan`, icon: "check" },
                { value: "accept_partial", title: "Terima sebagian", description: "Isi berat yang diterima", icon: "scale" },
                { value: "reject", title: "Tolak", description: "Wajib foto bukti dan alasan", icon: "close" },
              ]}
            />

            {decision === "accept_partial" && (
              <TextField
                label="Berat yang diterima"
                inputMode="decimal"
                autoComplete="off"
                suffix={`dari ${formatDecimal(shippedKg)} kg`}
                value={acceptedText}
                onChange={(event) => setAcceptedText(event.target.value.replace(/[^0-9,.]/g, "").slice(0, 6))}
                hint={
                  acceptedKg > 0 && acceptedKg < shippedKg
                    ? `${formatKg(shippedKg - acceptedKg)} yang tidak diterima wajib disertai foto dan alasan.`
                    : "Bagian yang tidak diterima wajib disertai foto dan alasan."
                }
              />
            )}

            {needsEvidence && (
              <Card className="flex flex-col gap-5 p-4 sm:p-5">
                <ChoiceGroup
                  legend={decision === "reject" ? "Kenapa ditolak?" : "Kenapa tidak diterima semua?"}
                  value={reason}
                  onChange={setReason}
                  columns={2}
                  options={REJECTION_REASONS.map((option) => ({ value: option, title: option }))}
                />
                <EvidencePhoto photoUrl={photoUrl} onPhoto={setPhotoUrl} />
                <TextArea label="Catatan (boleh kosong)" value={note} onChange={(event) => setNote(event.target.value)} maxLength={240} />
                {decision === "reject" && (
                  <p className="flex items-start gap-2 leading-snug text-ink-2">
                    <Icon name="ledger" size={20} className="mt-0.5 shrink-0" />
                    Penolakan masuk ke antrean sengketa KUB, lengkap dengan foto dan skor cek ulang.
                  </p>
                )}
              </Card>
            )}
            {failure && <Notice tone="danger" title={failure} />}
          </>
        )}
      </main>

      {view.batch.status === "in_transit" && !view.receipt && (
        <div className="sticky bottom-0 z-20 border-t border-line bg-paper/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 sm:px-6">
            {hint && (
              <p aria-live="polite" className="text-center font-semibold text-ink-2">
                {hint}
              </p>
            )}
            <Button
              size="xl"
              block
              variant={decision === "reject" ? "danger" : "primary"}
              busy={busy}
              disabled={hint !== null || busy}
              onClick={submit}
            >
              {primaryLabel}
            </Button>
          </div>
        </div>
      )}
      <RecheckSheet
        open={recheckOpen}
        onOpenChange={setRecheckOpen}
        shippedScore={view.averageScore}
        onSave={(score) => {
          setRecheckScore(score);
          setRecheckOpen(false);
        }}
      />
    </>
  );
}
