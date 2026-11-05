"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { FillMeter } from "@/components/ui/meters";
import { Sheet } from "@/components/ui/overlays";
import { Pill } from "@/components/ui/surface";
import { useDemoDatabase, useDemoHydrated, useDemoNow } from "@/data/demo-data-provider";
import { landingOutcome, type LandingOutcome } from "@/data/queries/landings";
import { shortHash } from "@/domain/audit-hash";
import { formatClock, formatDayDate, formatDecimal, formatKg, formatRupiah, formatScore } from "@/lib/format";
import { useOnline } from "./connection-status";

export function outcomeHeadline(outcome: LandingOutcome): string {
  const { landing, species } = outcome.view;
  switch (outcome.destination) {
    case "batch":
      return `${formatKg(outcome.batchedKg)} masuk pesanan ${species.name} ${outcome.batch?.order.minimumGrade ?? ""}`.trim();
    case "port_auction":
      return `${formatKg(landing.weightKg)} dijual ke TPI hari ini`;
    case "processing":
      return `${formatKg(landing.weightKg)} jadi bahan olahan`;
    case "not_for_consumption":
      return `${formatKg(landing.weightKg)} dicatat bukan untuk dimakan`;
  }
}

function payoutNote(outcome: LandingOutcome): string {
  switch (outcome.destination) {
    case "batch":
      return outcome.leftoverKg > 0
        ? `Termasuk ${formatKg(outcome.leftoverKg)} yang dijual ke TPI. Uang pesanan dibayar setelah pembeli menerima ikan.`
        : "Dibayar setelah pembeli menerima ikan.";
    case "port_auction":
      return "Perkiraan dari harga TPI rata-rata 7 hari.";
    case "processing":
      return "Dibayar saat pengolah mengambil bahan.";
    case "not_for_consumption":
      return "";
  }
}

export function whatsappSummary(outcome: LandingOutcome, kubName: string): string {
  const { landing, fisher, species } = outcome.view;
  const { grade, finalScore, auditHash } = outcome.grading;
  return [
    `*Nelayanku · ${kubName}*`,
    `Pak ${fisher.name}, ${formatDayDate(landing.landedAt)} ${formatClock(landing.landedAt)}`,
    `${species.name} ${formatKg(landing.weightKg)}, ${landing.iced ? "pakai es" : "tanpa es"}`,
    `${grade === "REJECT" ? "Tolak" : `Mutu ${grade}`}, skor ${formatScore(finalScore)} dari 9`,
    `${outcomeHeadline(outcome)}.`,
    outcome.payoutEstimate > 0 ? `Perkiraan diterima: ${formatRupiah(outcome.payoutEstimate)}. ${payoutNote(outcome)}` : null,
    `Kode bukti: ${shortHash(auditHash)}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function SavedTitle() {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-full bg-success text-white">
        <Icon name="check" size={18} strokeWidth={3} />
      </span>
      Tersimpan
    </span>
  );
}

export function SavedLandingSheet() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const db = useDemoDatabase();
  const now = useDemoNow();
  const hydrated = useDemoHydrated();
  const online = useOnline();
  const [closingOutcome, setClosingOutcome] = useState<LandingOutcome | null>(null);
  const landingId = searchParams.get("tersimpan");
  const outcome = landingId && hydrated ? landingOutcome(db, landingId, now) : undefined;
  const shown = outcome ?? closingOutcome;
  if (!shown) {
    return null;
  }

  const { fisher, species, landing } = shown.view;
  const close = () => {
    setClosingOutcome(shown);
    router.replace("/kub", { scroll: false });
  };
  const batch = shown.batch;

  return (
    <Sheet
      open={outcome !== undefined}
      onOpenChange={(open) => !open && close()}
      title={<SavedTitle />}
      description={outcomeHeadline(shown)}
      footer={
        <div className="flex flex-col gap-2 pb-1">
          <ButtonLink href="/kub/darat" size="xl" icon="scale" block>
            Catat pendaratan berikutnya
          </ButtonLink>
          <ButtonLink
            href={`https://wa.me/?text=${encodeURIComponent(whatsappSummary(shown, db.kub.name))}`}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="lg"
            icon="chat"
            block
          >
            Kirim ke WA Pak {fisher.name}
          </ButtonLink>
        </div>
      }
    >
      <div className="flex flex-col gap-4 pb-1">
        <div className="flex items-center gap-3">
          <GradeStamp grade={shown.grading.grade} size="md" />
          <div className="flex min-w-0 flex-col">
            <p className="font-bold">
              Pak {fisher.name} · {species.name} {formatKg(landing.weightKg)}
            </p>
            <p className="text-ink-2">
              Skor {formatScore(shown.grading.finalScore)} dari 9 · {landing.iced ? "pakai es" : "tanpa es"}
            </p>
          </div>
        </div>

        {batch && (
          <Link
            href={`/kub/batch/${batch.batch.id}`}
            className="group flex flex-col gap-2.5 rounded-[16px] border border-line bg-surface p-4 transition-[border-color,box-shadow] duration-150 hover:border-ink hover:shadow-raised"
          >
            <span className="flex items-baseline justify-between gap-3">
              <span className="font-bold">
                Pesanan {batch.species.name} {batch.order.minimumGrade}
              </span>
              <span className="type-num-m">
                {formatDecimal(batch.filledKg)}
                <span className="text-ink-2"> / {batch.targetKg} kg</span>
              </span>
            </span>
            <FillMeter
              filled={batch.filledKg}
              target={batch.targetKg}
              label={`${batch.species.name}: ${formatDecimal(batch.filledKg)} dari ${batch.targetKg} kg terisi`}
            />
            <span className="flex items-center justify-between gap-3 text-ink-2">
              <span className={batch.isFull ? "font-bold text-success-ink" : undefined}>
                {batch.isFull ? "Penuh, siap dibuat label" : `Kurang ${formatKg(batch.remainingKg)}`}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 font-bold text-ink">
                Buka
                <Icon name="chevronRight" size={20} className="transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </Link>
        )}

        {shown.payoutEstimate > 0 && (
          <div className="flex flex-col gap-1 rounded-[16px] bg-paper-deep p-4">
            <p className="text-ink-2">Perkiraan untuk Pak {fisher.name}</p>
            <p className="type-num-xl">{formatRupiah(shown.payoutEstimate)}</p>
            <p className="leading-snug text-ink-2">{payoutNote(shown)}</p>
          </div>
        )}

        {online ? (
          <Pill tone="success" dot className="self-start">
            Tersimpan dan terkirim
          </Pill>
        ) : (
          <Pill tone="warning" icon="savedOnDevice" className="self-start">
            Tanpa sinyal · dikirim saat ada sinyal
          </Pill>
        )}
      </div>
    </Sheet>
  );
}
