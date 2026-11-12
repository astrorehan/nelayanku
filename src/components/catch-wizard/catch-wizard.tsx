"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { dominantEyeClass } from "@/ai/sample-photos";
import { freshnessModel } from "@/ai/model-instance";
import { useCoarsePointer } from "@/components/camera/use-coarse-pointer";
import type { ParameterSource } from "@/components/grading/score-summary";
import { Button } from "@/components/ui/button";
import { parseDecimal } from "@/components/ui/choices";
import { Notice } from "@/components/ui/surface";
import { EYE_CLASS_LABEL, EYE_MANUAL_LABEL, GILL_MANUAL_LABEL, ODOR_LABEL, TEXTURE_LABEL } from "@/content/labels";
import { useDemoDatabase, useDemoHydrated, useDemoNow, useRepository } from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import { destinationPlan, fairPriceFor, type DestinationPlan, type RouteChoice } from "@/data/queries/destinations";
import { landingsOnDate, resumableLanding } from "@/data/queries/landings";
import type { Landing, SpeciesId } from "@/data/types";
import { assessFreshness, type OdorOption, type ParameterScores, type TextureOption } from "@/domain/freshness-score";
import { isSellableGrade } from "@/domain/grade";
import { formatDecimal, formatKg } from "@/lib/format";
import { eyeAssessment, gillAssessment, photoStepHint, usePhotoDraft } from "./photo-draft";
import { FairPriceSheet, LeaveSheet, OtherOptionsSheet, OverrideSheet, OverTargetSheet } from "./result-sheets";
import { routeAction } from "./route-copy";
import { StepCatch } from "./step-catch";
import { LandingSubject } from "./landing-subject";
import { landedTodayLabels, StepFisher } from "./step-fisher";
import { StepPhotos } from "./step-photos";
import { StepResult, type GradeOverride } from "./step-result";
import { sensesHint, StepSenses } from "./step-senses";
import { WizardFooter, WizardFrame } from "./wizard-frame";

type WizardStep = 1 | 2 | 3 | 4 | 5;
type ResultSheet = "fair-price" | "other-options" | "override" | "over-target" | null;

const STEP_LABEL: Record<WizardStep, string> = {
  1: "Nelayan",
  2: "Ikan dan berat",
  3: "Foto mata dan insang",
  4: "Bau dan tekstur",
  5: "Hasil dan tujuan",
};

const weightInputOf = (kg: number) => formatDecimal(kg).replace(/\./g, "");

function catchHint(iced: boolean | null, weightKg: number): string | null {
  if (iced === null && weightKg <= 0) {
    return "Jawab soal es dan isi berat dulu";
  }
  if (iced === null) {
    return "Pilih: pakai es atau tidak";
  }
  return weightKg > 0 ? null : "Isi berat timbangan dulu";
}

function CatchWizardSession({
  resume,
  resumeMissing,
  onRestart,
}: {
  resume: Landing | null;
  resumeMissing: boolean;
  onRestart: () => void;
}) {
  const router = useRouter();
  const repository = useRepository();
  const db = useDemoDatabase();
  const now = useDemoNow();
  const photos = usePhotoDraft();
  const coarsePointer = useCoarsePointer();
  const [step, setStep] = useState<WizardStep>(resume ? 3 : 1);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [fisherId, setFisherId] = useState<string | null>(resume?.fisherId ?? null);
  const [speciesId, setSpeciesId] = useState<SpeciesId | null>(resume?.speciesId ?? null);
  const [iced, setIced] = useState<boolean | null>(resume?.iced ?? null);
  const [weightText, setWeightText] = useState(resume ? weightInputOf(resume.weightKg) : "");
  const [landingId, setLandingId] = useState<string | null>(resume?.id ?? null);
  const [odor, setOdor] = useState<OdorOption | null>(null);
  const [texture, setTexture] = useState<TextureOption | null>(null);
  const [override, setOverride] = useState<GradeOverride | null>(null);
  const [sheet, setSheet] = useState<ResultSheet>(null);
  const [overrideFormKey, setOverrideFormKey] = useState(0);
  const [pendingBatchChoice, setPendingBatchChoice] = useState<Extract<RouteChoice, { kind: "batch" }> | null>(null);
  const [frozenPlan, setFrozenPlan] = useState<DestinationPlan | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [showMissingNotice, setShowMissingNotice] = useState(resumeMissing);

  const fisher = db.fishers.find((candidate) => candidate.id === fisherId) ?? null;
  const species = db.species.find((candidate) => candidate.id === speciesId) ?? null;
  const landing = landingId ? (db.landings.find((candidate) => candidate.id === landingId) ?? null) : null;
  const weightKg = parseDecimal(weightText);
  const photoHint = photoStepHint(photos.eye, photos.gill, coarsePointer);

  const eye = eyeAssessment(photos.eye);
  const gill = gillAssessment(photos.gill);
  const assessment = eye && gill && odor && texture ? assessFreshness({ eye: eye.probabilities, gill: gill.probabilities, odor, texture }) : null;
  const activeOverride = assessment && override && override.grade !== assessment.grade ? override : null;
  const grade = activeOverride?.grade ?? assessment?.grade ?? null;
  const livePlan = landing && grade ? destinationPlan(db, landing, grade, now) : null;
  const plan = frozenPlan ?? livePlan;
  const fairPrice = species && grade && isSellableGrade(grade) && grade !== "C" ? fairPriceFor(db, species.id, grade, now) : null;

  const goTo = (next: WizardStep) => {
    setDirection(next > step ? 1 : -1);
    setFailure(null);
    setStep(next);
  };

  const selectFisher = (id: string) => {
    const previousUsual = fisher?.usualSpeciesId ?? null;
    const nextFisher = db.fishers.find((candidate) => candidate.id === id);
    if (nextFisher && (speciesId === null || speciesId === previousUsual)) {
      setSpeciesId(nextFisher.usualSpeciesId);
    }
    setFisherId(id);
    setShowMissingNotice(false);
    goTo(2);
  };

  const saveLanding = async () => {
    if (!fisherId || !speciesId || iced === null || weightKg <= 0) {
      return;
    }
    setBusy(true);
    try {
      if (!landing) {
        const recorded = await repository.recordLanding({ fisherId, speciesId, weightKg, iced });
        setLandingId(recorded.id);
      } else if (
        landing.fisherId !== fisherId ||
        landing.speciesId !== speciesId ||
        landing.weightKg !== weightKg ||
        landing.iced !== iced
      ) {
        await repository.updateLanding({ landingId: landing.id, fisherId, speciesId, weightKg, iced });
      }
      goTo(3);
    } catch {
      setFailure("Pendaratan belum tersimpan. Coba lagi.");
    } finally {
      setBusy(false);
    }
  };

  const commit = async (choice: RouteChoice) => {
    if (!landing || !eye || !gill || !odor || !texture || !plan) {
      return;
    }
    setBusy(true);
    setFailure(null);
    setFrozenPlan(plan);
    try {
      await repository.saveGrading({
        landingId: landing.id,
        eye: eye.probabilities,
        gill: gill.probabilities,
        eyeSource: eye.source,
        gillSource: gill.source,
        odor,
        texture,
        modelVersion: freshnessModel.version,
      });
      if (activeOverride) {
        await repository.overrideGrade({ landingId: landing.id, grade: activeOverride.grade, reason: activeOverride.reason });
      }
      await repository.routeLanding({
        landingId: landing.id,
        destination: choice.kind,
        batchId: choice.kind === "batch" ? choice.view.batch.id : undefined,
      });
      router.replace(`/kub?tersimpan=${landing.id}`);
    } catch {
      setFrozenPlan(null);
      setBusy(false);
      setSheet(null);
      setFailure("Belum tersimpan. Pesanan mungkin sudah penuh; pilih tujuan lain atau coba lagi.");
    }
  };

  const choose = (choice: RouteChoice) => {
    if (choice.kind === "batch" && choice.leftoverKg > 0) {
      setPendingBatchChoice(choice);
      setSheet("over-target");
      return;
    }
    void commit(choice);
  };

  const openOverride = () => {
    setOverrideFormKey((key) => key + 1);
    setSheet("override");
  };

  const leave = () => router.push("/kub");
  const cancel = () => (fisherId ? setLeaving(true) : leave());

  if (step >= 3 && !landing) {
    return (
      <WizardFrame step={step} stepLabel={STEP_LABEL[step]} direction={direction} onCancel={leave}>
        <Notice tone="warning" title="Pendaratan ini sudah tidak ada">
          Data demo mungkin baru diatur ulang. Catat dari awal.
        </Notice>
        <Button size="lg" icon="reset" onClick={onRestart}>
          Mulai lagi
        </Button>
      </WizardFrame>
    );
  }

  const footerByStep: Record<WizardStep, ReactNode> = {
    1: null,
    2: (
      <WizardFooter
        hint={failure ?? catchHint(iced, weightKg)}
        onBack={() => goTo(1)}
        primary={
          <Button size="xl" iconAfter="arrowRight" disabled={catchHint(iced, weightKg) !== null || busy} busy={busy} onClick={saveLanding}>
            Lanjut: foto
          </Button>
        }
      />
    ),
    3: (
      <WizardFooter
        hint={photoHint}
        onBack={() => goTo(2)}
        primary={
          <Button size="xl" iconAfter="arrowRight" disabled={photoHint !== null} onClick={() => goTo(4)}>
            Lanjut: bau dan tekstur
          </Button>
        }
      />
    ),
    4: (
      <WizardFooter
        hint={sensesHint(odor, texture)}
        onBack={() => goTo(3)}
        primary={
          <Button size="xl" iconAfter="arrowRight" disabled={sensesHint(odor, texture) !== null} onClick={() => goTo(5)}>
            Lihat hasil
          </Button>
        }
      />
    ),
    5: plan && (
      <WizardFooter
        hint={failure}
        onBack={busy ? undefined : () => goTo(4)}
        primary={
          <Button
            size="xl"
            variant={plan.recommended.kind === "not_for_consumption" ? "danger" : "primary"}
            busy={busy}
            disabled={busy}
            onClick={() => choose(plan.recommended)}
          >
            {routeAction(plan.recommended)}
          </Button>
        }
      />
    ),
  };

  const parameterSources: Record<keyof ParameterScores, ParameterSource> = {
    eye: eye?.source === "model" ? "AI" : "manusia",
    gill: "manusia",
    odor: "manusia",
    texture: "manusia",
  };
  const parameterNotes: Partial<Record<keyof ParameterScores, string>> = {
    eye: photos.eye.modelResult
      ? EYE_CLASS_LABEL[dominantEyeClass(photos.eye.modelResult).eyeClass].title.toLowerCase()
      : photos.eye.manual
        ? EYE_MANUAL_LABEL[photos.eye.manual].title.toLowerCase()
        : undefined,
    gill: photos.gill.manual ? GILL_MANUAL_LABEL[photos.gill.manual].title.toLowerCase() : undefined,
    odor: odor ? ODOR_LABEL[odor].title.toLowerCase() : undefined,
    texture: texture ? TEXTURE_LABEL[texture].title.toLowerCase() : undefined,
  };
  const landingDescription = species && landing ? `${species.name} · ${formatKg(landing.weightKg)}` : "";
  const today = localDateOf(now);
  const subject =
    fisher && species && landing ? (
      <LandingSubject fisher={fisher} species={species} weightKg={landing.weightKg} iced={landing.iced} />
    ) : null;

  return (
    <>
      <WizardFrame step={step} stepLabel={STEP_LABEL[step]} direction={direction} onCancel={cancel} footer={footerByStep[step]}>
        {step === 1 && (
          <>
            {showMissingNotice && (
              <Notice tone="info" title="Pendaratan itu sudah dinilai">
                Atau datanya tidak ditemukan. Catat pendaratan baru di bawah.
              </Notice>
            )}
            <StepFisher
              fishers={db.fishers}
              species={db.species}
              landedToday={landedTodayLabels(
                landingsOnDate(db, today)
                  .filter((view) => view.landing.id !== landingId)
                  .map((view) => view.landing),
              )}
              selectedId={fisherId}
              onSelect={selectFisher}
            />
          </>
        )}
        {step === 2 && fisher && species && (
          <StepCatch
            fisher={fisher}
            species={db.species}
            speciesId={species.id}
            onSpecies={setSpeciesId}
            iced={iced}
            onIced={setIced}
            weightText={weightText}
            onWeight={setWeightText}
          />
        )}
        {step === 3 && <StepPhotos draft={photos} subject={subject} />}
        {step === 4 && <StepSenses subject={subject} odor={odor} onOdor={setOdor} texture={texture} onTexture={setTexture} />}
        {step === 5 && fisher && species && landing && assessment && grade && plan && (
          <StepResult
            fisherName={fisher.name}
            species={species}
            weightKg={landing.weightKg}
            iced={landing.iced}
            assessment={assessment}
            grade={grade}
            override={activeOverride}
            parameterSources={parameterSources}
            parameterNotes={parameterNotes}
            plan={plan}
            fairPrice={fairPrice}
            producerName={db.producers[0]?.name ?? "Pengolah"}
            onShowFairPrice={() => setSheet("fair-price")}
            onShowOtherOptions={() => setSheet("other-options")}
          />
        )}
      </WizardFrame>

      {fairPrice && species && grade && isSellableGrade(grade) && grade !== "C" && (
        <FairPriceSheet
          open={sheet === "fair-price"}
          onOpenChange={(open) => setSheet(open ? "fair-price" : null)}
          fair={fairPrice}
          speciesName={species.name}
          grade={grade}
          orderPricePerKg={plan?.recommended.kind === "batch" ? plan.recommended.view.breakdown.fisherReceivesPerKg : null}
        />
      )}
      {plan && (
        <OtherOptionsSheet
          open={sheet === "other-options"}
          onOpenChange={(open) => setSheet(open ? "other-options" : null)}
          description={`${landingDescription} · ${grade === "REJECT" ? "tolak" : `mutu ${grade}`}`}
          alternatives={plan.alternatives}
          onChoose={(choice) => {
            setSheet(null);
            choose(choice);
          }}
          onChangeGrade={openOverride}
        />
      )}
      {assessment && (
        <OverrideSheet
          key={overrideFormKey}
          open={sheet === "override"}
          onOpenChange={(open) => setSheet(open ? "override" : null)}
          modelGrade={assessment.grade}
          current={activeOverride}
          description={`${landingDescription} · hasil penilaian: ${assessment.grade === "REJECT" ? "tolak" : `mutu ${assessment.grade}`}`}
          onSave={(next) => {
            setOverride(next);
            setSheet(null);
          }}
          onClear={() => {
            setOverride(null);
            setSheet(null);
          }}
        />
      )}
      {fisher && landing && (
        <OverTargetSheet
          open={sheet === "over-target"}
          onOpenChange={(open) => setSheet(open ? "over-target" : null)}
          choice={pendingBatchChoice}
          fisherName={fisher.name}
          weightKg={landing.weightKg}
          busy={busy}
          onSplit={() => pendingBatchChoice && void commit(pendingBatchChoice)}
          onAllToAuction={() => {
            const auction = plan?.alternatives.find((choice) => choice.kind === "port_auction");
            if (auction) {
              void commit(auction);
            }
          }}
        />
      )}
      {fisher && (
        <LeaveSheet
          open={leaving}
          onOpenChange={setLeaving}
          fisherName={fisher.name}
          landingSummary={landing && species ? `${species.name.toLowerCase()} ${formatKg(landing.weightKg)}` : null}
          onLeave={leave}
        />
      )}
    </>
  );
}

export function CatchWizard() {
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("pendaratan");
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const [sessionNumber, setSessionNumber] = useState(0);
  const router = useRouter();

  if (resumeId && !hydrated) {
    return <WizardLoading />;
  }
  const resume = resumeId && sessionNumber === 0 ? resumableLanding(db, resumeId) : null;
  return (
    <CatchWizardSession
      key={`${resumeId ?? "baru"}-${sessionNumber}`}
      resume={resume}
      resumeMissing={resumeId !== null && sessionNumber === 0 && resume === null}
      onRestart={() => {
        setSessionNumber((number) => number + 1);
        router.replace("/kub/darat");
      }}
    />
  );
}

export function WizardLoading() {
  return <WizardFrame direction={1}>{null}</WizardFrame>;
}
