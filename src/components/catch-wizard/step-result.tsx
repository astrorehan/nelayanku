"use client";

import { ParameterBars, ScoreHeadline, type ParameterSource } from "@/components/grading/score-summary";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { FillMeter } from "@/components/ui/meters";
import { Card, Notice } from "@/components/ui/surface";
import { GRADE_SPOKEN } from "@/content/labels";
import { estimatedPayout, type DestinationPlan, type FairPrice, type RouteChoice } from "@/data/queries/destinations";
import type { FishSpecies } from "@/data/types";
import { ODOR_SCORE, type FreshnessAssessment, type ParameterScores } from "@/domain/freshness-score";
import type { Grade } from "@/domain/grade";
import { formatDecimal, formatKg, formatPriceRange, formatRupiah } from "@/lib/format";
import { ROUTE_ICON, routeDetail, routeTitle, sppgBlockCopy } from "./route-copy";
import { StepHeading } from "./wizard-frame";

export interface GradeOverride {
  grade: Grade;
  reason: string;
}

function OverrideNote({ modelGrade, override }: { modelGrade: Grade; override: GradeOverride }) {
  return (
    <p className="flex items-start gap-2 rounded-[12px] bg-paper-deep px-3.5 py-2.5 leading-snug">
      <Icon name="edit" size={20} className="mt-0.5 shrink-0" />
      <span>
        <b>
          Diubah operator dari {GRADE_SPOKEN[modelGrade]} ke {GRADE_SPOKEN[override.grade]}.
        </b>{" "}
        <span className="text-ink-2">Alasan: {override.reason.toLowerCase()}</span>
      </span>
    </p>
  );
}

function RouteIconTile({ choice }: { choice: RouteChoice }) {
  const tone =
    choice.kind === "not_for_consumption"
      ? "bg-grade-reject-tint text-grade-reject-ink"
      : choice.kind === "processing"
        ? "bg-grade-c-tint text-grade-c-ink"
        : "bg-paper-deep text-ink";
  return (
    <span className={`grid size-11 shrink-0 place-items-center rounded-[12px] ${tone}`}>
      <Icon name={ROUTE_ICON[choice.kind]} size={24} />
    </span>
  );
}

function PayoutEstimate({ choice, fisherName }: { choice: RouteChoice; fisherName: string }) {
  const payout = estimatedPayout(choice);
  if (payout <= 0) {
    return null;
  }
  const perKg =
    choice.kind === "batch" ? choice.view.breakdown.fisherReceivesPerKg : choice.kind === "not_for_consumption" ? 0 : choice.pricePerKg;
  return (
    <div className="flex items-end justify-between gap-3 border-t border-line pt-3">
      <span className="flex flex-col">
        <span className="text-ink-2">{choice.kind === "batch" ? "Untuk" : "Perkiraan untuk"} Pak {fisherName}</span>
        <span className="text-[0.9375rem] text-ink-2">
          {formatRupiah(perKg)}/kg{choice.kind === "batch" && choice.leftoverKg > 0 ? `, sisanya harga TPI` : ""}
        </span>
      </span>
      <span className="type-num-l">{formatRupiah(payout)}</span>
    </div>
  );
}

function SuggestedDestination({
  choice,
  grade,
  species,
  fisherName,
  producerName,
  rejectedForOdor,
  sppgBlocked,
}: {
  choice: RouteChoice;
  fisherName: string;
  sppgBlocked: boolean;
  grade: Grade;
  species: FishSpecies;
  producerName: string;
  rejectedForOdor: boolean;
}) {
  if (choice.kind === "batch") {
    const { view, kg, leftoverKg } = choice;
    const filledAfter = view.filledKg + kg;
    const fillsTheOrder = filledAfter >= view.targetKg;
    return (
      <Card className="flex flex-col gap-3.5 p-4 sm:p-5">
        <p className="type-eyebrow text-ink-2">Disarankan</p>
        <div className="flex items-start gap-3">
          <GradeStamp grade={view.order.minimumGrade} size="sm" />
          <div className="flex min-w-0 flex-col">
            <p className="type-h3">{routeTitle(choice)}</p>
            <p className="text-ink-2">{routeDetail(choice)}</p>
          </div>
        </div>
        <FillMeter
          size="lg"
          filled={view.filledKg}
          incoming={kg}
          target={view.targetKg}
          label={`${view.species.name}: ${formatDecimal(filledAfter)} dari ${view.targetKg} kg setelah ikan ini masuk`}
        />
        <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="type-num-m">
            {formatDecimal(view.filledKg)} + {formatDecimal(kg)} = {formatDecimal(filledAfter)}
            <span className="text-ink-2"> / {view.targetKg} kg</span>
          </span>
          {fillsTheOrder && (
            <span className="inline-flex items-center gap-1 font-semibold text-success-ink">
              <Icon name="check" size={18} strokeWidth={3} />
              penuh
            </span>
          )}
        </p>
        {leftoverKg > 0 && <p className="text-ink-2">Sisa {formatKg(leftoverKg)} dijual ke TPI hari ini.</p>}
        <PayoutEstimate choice={choice} fisherName={fisherName} />
      </Card>
    );
  }

  const copy = {
    port_auction: {
      eyebrow: "Disarankan",
      body: sppgBlocked
        ? `Pesanan ${species.name.toLowerCase()} yang masih kurang hanya untuk dapur SPPG.`
        : `Belum ada pesanan ${species.name.toLowerCase()} ${GRADE_SPOKEN[grade]} yang masih kurang.`,
    },
    processing: {
      eyebrow: "Bukan untuk pesanan segar",
      body: `${formatKg(choice.kg)} jadi bahan olahan. ${producerName} dan pengolah lain bisa mengambilnya.`,
    },
    not_for_consumption: {
      eyebrow: rejectedForOdor ? "Bau busuk" : "Skor di bawah 5",
      body: "Ikan ini tidak boleh dijual untuk dimakan. Catat agar tidak ikut tertimbang.",
    },
  }[choice.kind];

  return (
    <Card className="flex flex-col gap-3 p-4 sm:p-5">
      <p className="type-eyebrow text-ink-2">{copy.eyebrow}</p>
      <div className="flex items-start gap-3">
        <RouteIconTile choice={choice} />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="type-h3">{routeTitle(choice)}</p>
          <p className="leading-snug text-ink-2">{copy.body}</p>
        </div>
      </div>
      <PayoutEstimate choice={choice} fisherName={fisherName} />
    </Card>
  );
}

export function otherOptionsSummary(plan: DestinationPlan): string {
  const parts = ["ubah mutu"];
  if (plan.alternatives.some((choice) => choice.kind === "batch")) {
    parts.push("pesanan lain");
  }
  if (plan.alternatives.some((choice) => choice.kind === "port_auction")) {
    parts.push("jual ke TPI");
  }
  return `Pilihan lain: ${parts.join(", ")}`;
}

export function StepResult({
  fisherName,
  species,
  weightKg,
  iced,
  assessment,
  grade,
  override,
  parameterSources,
  parameterNotes,
  plan,
  fairPrice,
  producerName,
  onShowFairPrice,
  onShowOtherOptions,
}: {
  fisherName: string;
  species: FishSpecies;
  weightKg: number;
  iced: boolean;
  assessment: FreshnessAssessment;
  grade: Grade;
  override: GradeOverride | null;
  parameterSources: Record<keyof ParameterScores, ParameterSource>;
  parameterNotes: Partial<Record<keyof ParameterScores, string>>;
  plan: DestinationPlan;
  fairPrice: FairPrice | null;
  producerName: string;
  onShowFairPrice: () => void;
  onShowOtherOptions: () => void;
}) {
  const sppgBlock = plan.sppgBlock ? sppgBlockCopy(plan.sppgBlock, species, iced) : null;
  return (
    <>
      <StepHeading size="h2">
        {species.name} Pak {fisherName} · {formatKg(weightKg)}
      </StepHeading>

      <Card className="flex flex-col gap-5 p-5 sm:p-6">
        <ScoreHeadline grade={grade} finalScore={assessment.finalScore} stampKey={`${grade}-${assessment.finalScore}`} />
        {override && <OverrideNote modelGrade={assessment.grade} override={override} />}
        <ParameterBars
          parameters={assessment.parameters}
          sources={parameterSources}
          notes={parameterNotes}
          className="border-t border-line pt-5"
        />
      </Card>

      {sppgBlock && (
        <Notice tone="warning" title={sppgBlock.title}>
          {sppgBlock.body}
        </Notice>
      )}

      <SuggestedDestination
        choice={plan.recommended}
        grade={grade}
        species={species}
        fisherName={fisherName}
        producerName={producerName}
        rejectedForOdor={assessment.parameters.odor === ODOR_SCORE.rotten}
        sppgBlocked={plan.sppgBlock !== null}
      />

      {fairPrice && (
        <button
          type="button"
          onClick={onShowFairPrice}
          className="flex min-h-16 items-center gap-3 rounded-[16px] border border-line bg-surface px-4 py-3 text-left transition-[border-color,box-shadow] duration-150 hover:border-ink hover:shadow-raised"
        >
          <Icon name="coins" size={24} className="shrink-0" />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-ink-2">Harga wajar untuk nelayan, per kg</span>
            <span className="tabular text-lg font-semibold">{formatPriceRange(fairPrice.range.low, fairPrice.range.high)}</span>
          </span>
          <Icon name="chevronRight" size={22} className="shrink-0 text-ink-2" />
        </button>
      )}

      <Button variant="quiet" size="lg" block icon="menu" onClick={onShowOtherOptions}>
        {otherOptionsSummary(plan)}
      </Button>

    </>
  );
}
