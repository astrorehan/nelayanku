"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { ChoiceGroup } from "@/components/ui/choices";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { FillMeter, FreshClock } from "@/components/ui/meters";
import { Sheet } from "@/components/ui/overlays";
import { Card, Notice, Pill } from "@/components/ui/surface";
import { BATCH_STATUS_PILL } from "@/components/operator/order-card";
import { useDemoDatabase, useDemoHydrated, useDemoNow, useRepository } from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import { batchView, recentCouriers, type BatchView } from "@/data/queries/batches";
import { latestReferencePrice } from "@/data/queries/prices";
import type { ShippingChecklist } from "@/data/types";
import { formatClock, formatDecimal, formatDuration, formatKg, formatRupiah } from "@/lib/format";
import { ChecklistSheet } from "./checklist-sheet";
import { ContributionList } from "./contribution-list";
import { LabelSheet } from "./label-sheet";
import { OrderStatusNotice } from "./order-status-notice";
import { PriceBreakdownList } from "./price-breakdown";

type OrderSheet = "label" | "checklist" | "breakdown" | "unfilled" | null;
type UnfilledChoice = "ship_partial" | "sell_at_auction";

interface NextStep {
  label: string;
  icon: IconName;
  hint: string | null;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
}

function OrderHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-md lg:static lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
      <nav aria-label="Lokasi" className="mx-auto flex min-h-14 w-full max-w-6xl items-center px-2 sm:px-4 lg:min-h-20 lg:px-10 lg:pt-6">
        <Link href="/kub" className="inline-flex min-h-12 items-center gap-1 rounded-[12px] px-2 font-semibold text-ink-2 hover:text-ink">
          <Icon name="chevronLeft" size={22} />
          Beranda
        </Link>
        <span aria-hidden className="hidden text-ink-3 lg:inline">
          /
        </span>
        <span className="hidden px-2 font-semibold lg:inline" aria-current="page">
          Pesanan
        </span>
      </nav>
    </header>
  );
}

function UnfilledChoices({ view, value, onChange }: { view: BatchView; value: UnfilledChoice | null; onChange: (value: UnfilledChoice) => void }) {
  return (
    <ChoiceGroup
      legend="Apa yang dilakukan?"
      value={value}
      onChange={onChange}
      columns={1}
      options={[
        {
          value: "ship_partial",
          title: `Kirim ${formatKg(view.filledKg)} saja`,
          description: "Pembeli diberi tahu dan membayar sesuai berat",
          icon: "courier",
          disabled: view.filledKg === 0,
        },
        {
          value: "sell_at_auction",
          title: "Batalkan, jual ke TPI",
          description: "Pembeli diberi tahu, uang muka dikembalikan",
          icon: "balance",
        },
      ]}
    />
  );
}

function FillSummary({ view }: { view: BatchView }) {
  const status = BATCH_STATUS_PILL[view.batch.status];
  const windowHours = view.allIced ? view.species.freshnessWindow.icedHours : view.species.freshnessWindow.unicedHours;
  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-end justify-between gap-3">
        <p className="type-num-xl">
          {formatDecimal(view.filledKg)}
          <span className="type-h2 text-ink-2"> / {view.targetKg} kg</span>
        </p>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>
      <FillMeter size="lg" filled={view.filledKg} target={view.targetKg} label={`${formatDecimal(view.filledKg)} dari ${view.targetKg} kg terisi`} />
      {!view.isFull && view.batch.status === "filling" && (
        <p className="text-ink-2">
          Kurang {formatKg(view.remainingKg)} · batas isi {formatClock(view.batch.fillDeadline)}
        </p>
      )}
      {view.freshRemainingMinutes !== null && view.freshStatus && view.earliestLandedAt && (
        <div className="flex items-center gap-3.5 border-t border-line pt-4">
          <FreshClock remainingMinutes={view.freshRemainingMinutes} totalMinutes={windowHours * 60} status={view.freshStatus} size={56} />
          <div className="flex min-w-0 flex-col">
            <span className="text-ink-2">Jam segar tersisa</span>
            <span className="type-num-m">{formatDuration(view.freshRemainingMinutes)}</span>
            <span className="text-[0.9375rem] leading-snug text-ink-2">
              Sejak darat pertama {formatClock(view.earliestLandedAt)} · {view.allIced ? "pakai es" : "ada yang tanpa es"} · batas{" "}
              {view.species.name.toLowerCase()} {view.allIced ? "ber-es" : "tanpa es"} {windowHours} jam
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

export function OrderDetail({ batchId }: { batchId: string }) {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const now = useDemoNow();
  const repository = useRepository();
  const [sheet, setSheet] = useState<OrderSheet>(null);
  const [checklistKey, setChecklistKey] = useState(0);
  const [unfilledChoice, setUnfilledChoice] = useState<UnfilledChoice | null>(null);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  if (!hydrated) {
    return (
      <>
        <OrderHeader />
        <main className="mx-auto w-full max-w-6xl px-4 pt-4 sm:px-6 lg:px-10">
          <p className="flex items-center gap-2 font-semibold text-ink-2">
            <Icon name="sync" size={20} className="animate-spin" />
            Memuat pesanan…
          </p>
        </main>
      </>
    );
  }

  const view = batchView(db, batchId, now);
  if (!view) {
    return (
      <>
        <OrderHeader />
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-4 sm:px-6">
          <Notice tone="warning" title="Pesanan tidak ditemukan">
            Mungkin data demo baru diatur ulang.
          </Notice>
          <ButtonLink href="/kub" variant="quiet" size="lg" icon="home" className="self-start">
            Ke Beranda
          </ButtonLink>
        </main>
      </>
    );
  }

  const { batch, order, buyer, species } = view;
  const portPricePerKg = latestReferencePrice(db, species.id, "port", localDateOf(now)).pricePerKg;
  const deadlinePassed = batch.status === "filling" && now.getTime() > new Date(batch.fillDeadline).getTime();

  const run = async (action: () => Promise<unknown>, after?: () => void) => {
    setBusy(true);
    setFailure(null);
    try {
      await action();
      after?.();
    } catch {
      setFailure("Belum tersimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const makeLabel = () => run(() => repository.labelBatch(batch.id), () => setSheet("label"));
  const applyUnfilledChoice = () => {
    if (unfilledChoice === "ship_partial") {
      void makeLabel();
    } else if (unfilledChoice === "sell_at_auction") {
      void run(() => repository.cancelUnfilledBatch(batch.id), () => setSheet(null));
    }
  };
  const depart = (checklist: ShippingChecklist) =>
    void run(() => repository.departBatch({ batchId: batch.id, checklist }), () => setSheet(null));
  const openChecklist = () => {
    setChecklistKey((key) => key + 1);
    setSheet("checklist");
  };

  const nextStep: NextStep | null =
    batch.status === "filling" && deadlinePassed
      ? {
          label: "Lanjutkan",
          icon: "arrowRight",
          hint: unfilledChoice ? null : "Pilih salah satu dulu",
          disabled: unfilledChoice === null,
          onClick: applyUnfilledChoice,
        }
      : batch.status === "filling"
        ? { label: "Tambah dari pendaratan", icon: "scale", hint: `Kurang ${formatKg(view.remainingKg)} lagi`, href: "/kub/darat" }
        : batch.status === "full"
          ? { label: "Buat label QR", icon: "qr", hint: "Berikutnya: label, lalu checklist kirim", onClick: makeLabel }
          : batch.status === "labelled"
            ? { label: "Checklist kirim", icon: "courier", hint: "Label siap. Berikutnya: checklist, lalu berangkat", onClick: openChecklist }
            : null;

  const primaryButton = (block: boolean): ReactNode =>
    nextStep &&
    (nextStep.href ? (
      <ButtonLink href={nextStep.href} size="xl" icon={nextStep.icon} block={block}>
        {nextStep.label}
      </ButtonLink>
    ) : (
      <Button size="xl" icon={nextStep.icon} block={block} busy={busy} disabled={nextStep.disabled || busy} onClick={nextStep.onClick}>
        {nextStep.label}
      </Button>
    ));

  const canShowLabel = batch.status === "labelled" || batch.status === "in_transit";

  return (
    <>
      <OrderHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-4 sm:px-6 lg:px-10 lg:pt-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3.5">
            <GradeStamp grade={order.minimumGrade} size="md" className="mt-0.5" />
            <div className="flex min-w-0 flex-col gap-1">
              <h1 className="type-h1">
                Pesanan {species.name} {order.minimumGrade}
              </h1>
              <p className="text-ink-2">
                {buyer.name} · kirim {formatClock(order.deliverAt)} · kode <span className="type-code text-ink">{batch.code}</span>
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 lg:flex">
            {canShowLabel && (
              <Button variant="quiet" size="lg" icon="qr" onClick={() => setSheet("label")}>
                Lihat label
              </Button>
            )}
            {primaryButton(false)}
          </div>
        </div>

        {failure && <Notice tone="danger" title={failure} />}
        <OrderStatusNotice view={view} />
        {deadlinePassed && (
          <Notice tone="warning" title={`Batas isi ${formatClock(batch.fillDeadline)} sudah lewat`}>
            Pesanan masih kurang {formatKg(view.remainingKg)}. Pilih yang dilakukan dengan isi sekarang.
          </Notice>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            <FillSummary view={view} />
            {deadlinePassed && <UnfilledChoices view={view} value={unfilledChoice} onChange={setUnfilledChoice} />}
            <section aria-labelledby="isi-pesanan" className="flex flex-col gap-2">
              <h2 id="isi-pesanan" className="type-h3">
                Isi dari {new Set(view.contributions.map((contribution) => contribution.fisher.id)).size} nelayan
              </h2>
              <Card className="px-4 py-1 sm:px-5">
                <ContributionList contributions={view.contributions} />
              </Card>
            </section>
            {batch.status === "filling" && !deadlinePassed && (
              <Button variant="ghost" size="md" className="self-start underline underline-offset-4" onClick={() => setSheet("unfilled")}>
                Pesanan tidak akan penuh?
              </Button>
            )}
          </div>

          <aside aria-labelledby="rincian-harga" className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setSheet("breakdown")}
              className="flex min-h-16 items-center gap-3 rounded-[16px] border border-line bg-surface px-4 py-3 text-left hover:border-ink lg:hidden"
            >
              <Icon name="coins" size={24} className="shrink-0" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-ink-2">Nelayan menerima</span>
                <span className="tabular text-lg font-bold">{formatRupiah(view.breakdown.fisherReceivesPerKg)}/kg</span>
              </span>
              <Icon name="chevronRight" size={22} className="shrink-0 text-ink-2" />
            </button>
            <Card className="hidden flex-col gap-1 p-5 lg:flex">
              <h2 id="rincian-harga" className="type-h3 pb-1">
                Rincian harga per kg
              </h2>
              <PriceBreakdownList breakdown={view.breakdown} buyerKind={buyer.kind} portPricePerKg={portPricePerKg} />
              <p className="text-[0.9375rem] leading-snug text-ink-2">Ketuk baris untuk melihat rumusnya.</p>
            </Card>
            {canShowLabel && (
              <Button variant="quiet" size="lg" icon="qr" className="lg:hidden" onClick={() => setSheet("label")}>
                Lihat label
              </Button>
            )}
            {batch.status === "in_transit" || batch.status === "received" ? (
              <ButtonLink href={`/lacak/${batch.code}`} variant="ghost" size="md" iconAfter="external" className="self-start">
                Halaman lacak untuk pembeli
              </ButtonLink>
            ) : null}
          </aside>
        </div>
      </main>

      {nextStep && (
        <div className="sticky bottom-0 z-20 border-t border-line bg-paper/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-2 px-4 sm:px-6">
            {nextStep.hint && (
              <p aria-live="polite" className="text-center font-semibold text-ink-2">
                {nextStep.hint}
              </p>
            )}
            {primaryButton(true)}
          </div>
        </div>
      )}

      <LabelSheet open={sheet === "label"} onOpenChange={(open) => setSheet(open ? "label" : null)} view={view} kub={db.kub} />
      <ChecklistSheet
        key={checklistKey}
        open={sheet === "checklist"}
        onOpenChange={(open) => setSheet(open ? "checklist" : null)}
        view={view}
        recentCouriers={recentCouriers(db)}
        busy={busy}
        onDepart={depart}
      />
      <Sheet
        open={sheet === "breakdown"}
        onOpenChange={(open) => setSheet(open ? "breakdown" : null)}
        title="Rincian harga per kg"
        description="Ketuk baris untuk melihat rumusnya."
      >
        <PriceBreakdownList breakdown={view.breakdown} buyerKind={buyer.kind} portPricePerKg={portPricePerKg} className="pb-2" />
      </Sheet>
      <Sheet
        open={sheet === "unfilled"}
        onOpenChange={(open) => setSheet(open ? "unfilled" : null)}
        title="Pesanan tidak akan penuh?"
        description={`Sekarang ${formatKg(view.filledKg)} dari ${view.targetKg} kg. Batas isi ${formatClock(batch.fillDeadline)}.`}
        footer={
          <div className="flex flex-col gap-2 pb-1">
            {!unfilledChoice && <p className="text-center font-semibold text-ink-2">Pilih salah satu dulu</p>}
            <Button size="xl" block busy={busy} disabled={!unfilledChoice || busy} onClick={applyUnfilledChoice}>
              Lanjutkan
            </Button>
          </div>
        }
      >
        <div className="pb-2">
          <UnfilledChoices view={view} value={unfilledChoice} onChange={setUnfilledChoice} />
        </div>
      </Sheet>
    </>
  );
}
