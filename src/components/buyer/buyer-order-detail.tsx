"use client";

import clsx from "clsx";
import Image from "next/image";
import { Icon } from "@/components/icons/icon";
import { PrintDocumentButton } from "@/components/documents/buyer-documents";
import { RolePage } from "@/components/layout/role-shell";
import { BATCH_STATUS_PILL } from "@/components/operator/order-card";
import { BuyerTopBar } from "@/components/shells/role-shells";
import { ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { FillMeter } from "@/components/ui/meters";
import { Card, LedgerRow, Notice, Pill, SourceNote } from "@/components/ui/surface";
import { useDemoDatabase, useDemoHydrated, useDemoNow } from "@/data/demo-data-provider";
import { DEMO_BUYER_ID } from "@/data/demo-identities";
import { batchViewByCode, type BatchView } from "@/data/queries/batches";
import { orderMoney, orderTimeline, type TimelineStep } from "@/data/queries/buyer-pages";
import {
  formatClock,
  formatDecimal,
  formatKg,
  formatRupiah,
  formatScore,
  formatShortDayDate,
} from "@/lib/format";
import { buyerStatusLine } from "./buyer-orders-view";

const BACK = { href: "/pembeli/pesanan", label: "Kembali ke pesanan" };

const PARAMETERS = [
  ["eye", "Mata"],
  ["gill", "Insang"],
  ["odor", "Bau"],
  ["texture", "Tekstur"],
] as const;

const DECISION_TEXT = {
  accept_all: "Diterima semua",
  accept_partial: "Diterima sebagian",
  reject: "Ditolak",
} as const;

function Timeline({ steps }: { steps: TimelineStep[] }) {
  return (
    <ol aria-label="Perjalanan pesanan" className="flex flex-col">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li
            key={step.key}
            aria-current={step.state === "current" ? "step" : undefined}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {!last && (
              <span
                aria-hidden
                className={clsx(
                  "absolute left-[0.8125rem] top-7 bottom-0 w-0.5",
                  step.state === "done" ? "bg-sea" : "bg-line",
                )}
              />
            )}
            <span
              aria-hidden
              className={clsx(
                "relative z-10 grid size-7 shrink-0 place-items-center rounded-full border-2",
                step.state === "done" && "border-sea bg-sea text-white",
                step.state === "current" && "border-gold bg-gold-tint",
                step.state === "pending" && "border-line bg-surface",
                step.state === "failed" && "border-danger bg-danger text-white",
              )}
            >
              {step.state === "done" && <Icon name="check" size={14} strokeWidth={3} />}
              {step.state === "failed" && <Icon name="close" size={14} strokeWidth={3} />}
            </span>
            <div className="flex min-w-0 flex-col">
              <span
                className={clsx(
                  "font-semibold",
                  step.state === "pending" && "text-ink-2",
                  step.state === "failed" && "text-danger-ink",
                )}
              >
                {step.title}
                <span className="sr-only">
                  {step.state === "done"
                    ? ", selesai"
                    : step.state === "current"
                      ? ", sedang berjalan"
                      : step.state === "failed"
                        ? ", gagal"
                        : ", belum"}
                </span>
              </span>
              <span className="text-ink-2">
                {step.at
                  ? `${formatShortDayDate(step.at)}, ${formatClock(step.at)}`
                  : step.state === "current"
                    ? "Sedang berjalan"
                    : "Belum"}
                {step.note ? ` · ${step.note}` : ""}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function QualityCard({ view }: { view: BatchView }) {
  const parameters = view.averageParameters;
  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <h2 className="type-h3">Bukti mutu</h2>
      {parameters ? (
        <>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PARAMETERS.map(([key, label]) => (
              <div key={key} className="flex flex-col-reverse rounded-[14px] bg-paper px-3 py-2.5">
                <dt className="text-sm text-ink-2">{label}</dt>
                <dd className="type-money text-[1.375rem]">{formatScore(parameters[key])}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-col gap-1.5">
            {view.averageScore !== null && (
              <LedgerRow label="Skor rata-rata" value={`${formatScore(view.averageScore)} dari 10`} strong />
            )}
            <LedgerRow label="Es di peti" value={view.allIced ? "Semua pakai es" : "Ada yang tanpa es"} />
            {view.earliestLandedAt && (
              <LedgerRow label="Jam darat pertama" value={`${formatClock(view.earliestLandedAt)} WIB`} />
            )}
            <LedgerRow label="Pendaratan dalam peti" value={`${view.contributions.length}`} />
          </div>
        </>
      ) : (
        <p className="text-ink-2">Belum ada ikan di peti, jadi belum ada skor. Skor muncul setelah KUB mengisi.</p>
      )}
      {view.contributions.length > 0 && (
        <ButtonLink href={`/lacak/${view.batch.code}`} variant="quiet" icon="shield" block>
          Lihat bukti mutu dan asal ikan
        </ButtonLink>
      )}
    </Card>
  );
}

function MoneyCard({ view }: { view: BatchView }) {
  const money = orderMoney(view);
  return (
    <Card className="flex flex-col gap-3 p-4 sm:p-5">
      <h2 className="type-h3">Harga dan pembayaran</h2>
      <div className="flex flex-col gap-1.5">
        <LedgerRow label="Harga per kg" value={formatRupiah(view.order.pricePerKg)} />
        <LedgerRow
          label={money.estimated ? "Total (perkiraan)" : "Total"}
          value={formatRupiah(money.total)}
          strong
        />
        <LedgerRow
          label={`Uang muka ${Math.round(view.order.downPaymentRate * 100)}% (simulasi)`}
          value={formatRupiah(money.down)}
          muted
        />
        <LedgerRow
          label="Sisa"
          value={money.paid ? "Lunas (simulasi)" : formatRupiah(money.remaining)}
          muted
        />
      </div>
      {money.late && (
        <Pill tone="warning" icon="clock">
          Dibayar lewat tenggat
        </Pill>
      )}
      {view.batch.status === "rejected" && (
        <p className="text-ink-2">Pesanan ditolak, jadi tidak ada tagihan yang tersisa.</p>
      )}
      {view.batch.status === "cancelled" && (
        <p className="text-ink-2">Dibatalkan KUB, uang muka dikembalikan (simulasi).</p>
      )}
      {!money.paid && view.batch.status !== "rejected" && view.batch.status !== "cancelled" && (
        <p className="text-ink-2">Sisa dibayar saat kiriman Anda terima.</p>
      )}
      <SourceNote simulated>Pembayaran nyata dilakukan di luar demo.</SourceNote>
    </Card>
  );
}

function ReceiptCard({ view }: { view: BatchView }) {
  const receipt = view.receipt;
  if (!receipt) {
    return null;
  }
  const rejected = receipt.decision === "reject";
  return (
    <Card className="flex flex-col gap-3 p-4 sm:p-5">
      <h2 className="type-h3">Hasil penerimaan</h2>
      <div className="flex flex-col gap-1.5">
        <LedgerRow label="Keputusan" value={DECISION_TEXT[receipt.decision]} strong />
        <LedgerRow label="Dikirim" value={formatKg(view.filledKg)} />
        <LedgerRow label="Diterima" value={formatKg(rejected ? 0 : receipt.acceptedKg)} />
        {receipt.recheckScore !== null && (
          <LedgerRow label="Skor cek ulang Anda" value={formatScore(receipt.recheckScore)} />
        )}
        <LedgerRow label="Waktu" value={`${formatShortDayDate(receipt.receivedAt)}, ${formatClock(receipt.receivedAt)}`} />
      </div>
      {receipt.reason && (
        <p>
          <span className="font-semibold">Alasan:</span> {receipt.reason}
        </p>
      )}
      {receipt.note && (
        <p>
          <span className="font-semibold">Catatan:</span> {receipt.note}
        </p>
      )}
      {receipt.evidencePhotoDataUrl ? (
        <div className="flex flex-col gap-2">
          <p className="font-semibold">Foto bukti</p>
          <span className="relative block aspect-[4/3] w-full max-w-sm overflow-hidden rounded-[14px] border border-line bg-paper-deep">
            <Image
              src={receipt.evidencePhotoDataUrl}
              alt="Foto bukti penerimaan"
              fill
              sizes="(min-width: 640px) 384px, 100vw"
              unoptimized
              className="object-cover"
            />
          </span>
        </div>
      ) : (
        (rejected || receipt.decision === "accept_partial") && (
          <p className="text-ink-2">Tidak ada foto bukti tersimpan untuk pesanan ini.</p>
        )
      )}
      {rejected && (
        <Notice tone="warning" title="Masuk antrean sengketa KUB">
          Operator KUB memeriksa foto, alasan, dan skor cek ulang.
        </Notice>
      )}
    </Card>
  );
}

export function BuyerOrderDetail({ code }: { code: string }) {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const now = useDemoNow();

  if (!hydrated) {
    return (
      <>
        <BuyerTopBar title="Pesanan" back={BACK} />
        <RolePage>
          <p className="flex items-center gap-2 font-semibold text-ink-2">
            <Icon name="sync" size={20} className="animate-spin" />
            Memuat pesanan…
          </p>
        </RolePage>
      </>
    );
  }

  const view = batchViewByCode(db, code, now);
  if (!view || view.buyer.id !== DEMO_BUYER_ID) {
    return (
      <>
        <BuyerTopBar title="Pesanan" back={BACK} />
        <RolePage>
          <Notice tone="warning" title="Pesanan tidak ditemukan">
            Periksa kodenya, misalnya TGK-A-0511, atau pilih dari daftar pesanan.
          </Notice>
          <ButtonLink href="/pembeli/pesanan" variant="quiet" icon="arrowLeft" className="self-start">
            Ke daftar pesanan
          </ButtonLink>
        </RolePage>
      </>
    );
  }

  const status = BATCH_STATUS_PILL[view.batch.status];
  const filling = view.batch.status === "filling" || view.batch.status === "full";
  const canInvoice = !!view.receipt && view.receipt.decision !== "reject";

  return (
    <>
      <BuyerTopBar title={view.batch.code} subtitle={`${view.species.name} · ${buyerStatusLine(view)}`} back={BACK} />
      <RolePage className="gap-5 lg:gap-6">
        <Card className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <GradeStamp grade={view.batchGrade ?? view.order.minimumGrade} size="md" />
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="type-h2">
                {view.species.name} · {formatKg(view.receipt ? (view.receipt.decision === "reject" ? view.filledKg : view.receipt.acceptedKg) : view.filledKg || view.targetKg)}
              </span>
              <span className="text-ink-2">
                Kirim {formatShortDayDate(view.order.deliverAt)}, {formatClock(view.order.deliverAt)} · minimal mutu{" "}
                {view.order.minimumGrade}
              </span>
              <span className="type-code text-ink-2">{view.batch.code}</span>
            </div>
            <Pill tone={status.tone}>{status.label}</Pill>
          </div>
          {filling && (
            <div className="flex flex-col gap-1.5">
              <FillMeter
                label={`Isi peti ${formatDecimal(view.filledKg)} dari ${view.targetKg} kg`}
                filled={view.filledKg}
                target={view.targetKg}
              />
              <span className="text-ink-2">
                {formatDecimal(view.filledKg)} dari {view.targetKg} kg terisi
                {view.remainingKg > 0 ? `, kurang ${formatKg(view.remainingKg)}` : ""}
              </span>
            </div>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {view.batch.status === "in_transit" && (
              <ButtonLink href={`/pembeli/terima/${view.batch.code}`} size="lg" icon="coolBox">
                Terima kiriman
              </ButtonLink>
            )}
            {canInvoice && (
              <PrintDocumentButton kind="faktur" view={view} label="Faktur / simpan PDF" variant="quiet" />
            )}
            <ButtonLink
              href={`/pembeli/pesan?ikan=${view.species.id}`}
              variant="quiet"
              size="md"
              icon="plus"
            >
              Pesan lagi
            </ButtonLink>
            <ButtonLink href="/pembeli/dokumen" variant="ghost" size="md" icon="document">
              Semua dokumen
            </ButtonLink>
          </div>
        </Card>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
          <div className="flex min-w-0 flex-col gap-5">
            <Card className="flex flex-col gap-4 p-4 sm:p-5">
              <h2 className="type-h3">Perjalanan pesanan</h2>
              <Timeline steps={orderTimeline(view)} />
            </Card>
            <ReceiptCard view={view} />
          </div>
          <div className="flex min-w-0 flex-col gap-5">
            <QualityCard view={view} />
            <MoneyCard view={view} />
          </div>
        </div>
      </RolePage>
    </>
  );
}
