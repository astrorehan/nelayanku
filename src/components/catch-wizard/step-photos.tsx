"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { dominantEyeClass, type SamplePhoto } from "@/ai/sample-photos";
import { CameraCapture } from "@/components/camera/camera-capture";
import { useCoarsePointer } from "@/components/camera/use-coarse-pointer";
import { EyeManualChoice, GillManualChoice } from "@/components/grading/human-inputs";
import { PhotoDropzone, SamplePicker } from "@/components/grading/photo-pickers";
import { ScanPhoto } from "@/components/grading/scan-photo";
import { Icon, type IconName } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/choices";
import { Sheet } from "@/components/ui/overlays";
import { Notice, Pill } from "@/components/ui/surface";
import { EYE_CLASS_LABEL, QUALITY_PROBLEM_LABEL } from "@/content/labels";
import { formatPercent } from "@/lib/format";
import { eyeAssessment, eyeAwaitsRetakeDecision, eyePhotoSrc, type EyeDraft, type PhotoDraft } from "./photo-draft";
import { StepHeading } from "./wizard-frame";

function PartTabTitle({ icon, label, done }: { icon: IconName; label: string; done: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <Icon name={icon} size={20} />
      {label}
      {done && (
        <span className="grid size-5 place-items-center rounded-full bg-success text-white">
          <Icon name="check" size={13} strokeWidth={3} />
          <span className="sr-only">, selesai</span>
        </span>
      )}
    </span>
  );
}

function PreparingPhoto({ shape }: { shape: "tall" | "wide" }) {
  return (
    <div
      className={
        shape === "tall"
          ? "grid aspect-[4/5] w-full place-items-center rounded-[22px] bg-paper-deep sm:aspect-[4/3]"
          : "grid aspect-[4/3] w-full place-items-center rounded-[22px] bg-paper-deep"
      }
    >
      <p className="flex items-center gap-2 font-semibold">
        <Icon name="sync" size={20} className="animate-spin" />
        Menyiapkan foto…
      </p>
    </div>
  );
}

function UnreadablePhotoNotice() {
  return (
    <Notice tone="warning" title="Foto tidak bisa dibuka">
      Coba foto lain, misalnya JPG atau PNG.
    </Notice>
  );
}

function ModelReading({ eye }: { eye: EyeDraft }) {
  if (eye.assessing || !eye.modelResult) {
    return (
      <p className="flex items-center gap-2 font-semibold">
        <Icon name="sync" size={20} className="animate-spin" />
        Menilai mata…
      </p>
    );
  }
  const { eyeClass, share } = dominantEyeClass(eye.modelResult);
  return (
    <div className="flex flex-col gap-1">
      <p className="type-h3">AI: {EYE_CLASS_LABEL[eyeClass].title.toLowerCase()}</p>
      <p className="leading-snug text-ink-2">{EYE_CLASS_LABEL[eyeClass].reason}</p>
      <p className="flex flex-wrap items-center gap-2 text-ink-2">
        Keyakinan {formatPercent(share)}
        <Pill tone="gold">Model simulasi</Pill>
      </p>
    </div>
  );
}

function EyePart({ draft, coarsePointer }: { draft: PhotoDraft; coarsePointer: boolean }) {
  const { eye } = draft;
  const [samplesOpen, setSamplesOpen] = useState(false);
  const pickSample = (sample: SamplePhoto) => {
    setSamplesOpen(false);
    void draft.pickSample(sample);
  };

  if (!eye.photo) {
    return (
      <>
        <StepHeading size="h2">{coarsePointer ? "Arahkan kamera ke mata ikan" : "Pilih foto mata ikan"}</StepHeading>
        {draft.unreadablePart === "eye" && <UnreadablePhotoNotice />}
        {draft.preparing === "eye" ? (
          <PreparingPhoto shape="tall" />
        ) : coarsePointer ? (
          <>
            <CameraCapture guide="eye" autoStart onCapture={draft.takeEyePhoto} onUploadInstead={draft.takeEyePhoto} />
            <Button variant="quiet" size="lg" icon="fish" onClick={() => setSamplesOpen(true)}>
              Pakai foto contoh
            </Button>
          </>
        ) : (
          <>
            <p className="text-ink-2">Laptop tidak punya kamera belakang. Pilih foto contoh atau unggah foto.</p>
            <SamplePicker selectedId={null} onSelect={pickSample} />
            <PhotoDropzone compact onFile={draft.takeEyePhoto} />
          </>
        )}
        <p className="text-[0.875rem] leading-snug text-ink-2">
          Foto contoh: mata ikan kembung dari dataset FFE (Prasetyo dkk., 2022, CC BY 4.0), bukan ikan yang sedang dicatat.
        </p>
        <Sheet
          open={samplesOpen}
          onOpenChange={setSamplesOpen}
          title="Foto contoh"
          description="Mata ikan kembung dari dataset FFE. AI demo hanya bisa menilai foto-foto ini."
        >
          <SamplePicker selectedId={null} onSelect={pickSample} />
        </Sheet>
      </>
    );
  }

  const isSample = eye.photo.kind === "sample";
  const awaitsDecision = eyeAwaitsRetakeDecision(eye);
  const problems = eye.photo.kind === "taken" ? eye.photo.problems : [];
  return (
    <>
      <StepHeading size="h2">
        {isSample ? "Mata ikan dinilai AI" : awaitsDecision ? "Periksa foto mata" : "Bagaimana mata ikannya?"}
      </StepHeading>
      <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <ScanPhoto src={eyePhotoSrc(eye.photo)} alt="Foto mata ikan yang dinilai" scanning={eye.assessing} />
        <div aria-live="polite" className="flex min-w-0 flex-col items-start gap-3">
          {isSample ? (
            <ModelReading eye={eye} />
          ) : (
            <p className="flex items-center gap-2 font-semibold">
              <Icon name={awaitsDecision ? "warning" : "check"} size={20} className={awaitsDecision ? "text-warning-ink" : "text-success-ink"} />
              {awaitsDecision ? "Foto kurang jelas" : "Foto jelas"}
            </p>
          )}
          <Button variant="quiet" size="md" icon="camera" onClick={draft.retakeEye} disabled={eye.assessing}>
            {isSample ? "Ganti foto" : "Potret ulang"}
          </Button>
        </div>
      </div>
      {awaitsDecision && (
        <Notice
          tone="warning"
          action={
            <Button variant="quiet" size="md" onClick={draft.keepEyePhotoAnyway}>
              Tetap pakai
            </Button>
          }
        >
          {QUALITY_PROBLEM_LABEL[problems[0]]}
        </Notice>
      )}
      {!isSample && !awaitsDecision && (
        <>
          <Notice tone="info" title="Mata dinilai manusia">
            AI demo hanya bisa menilai foto contoh. Pilih yang paling mirip dengan mata ikan ini.
          </Notice>
          <EyeManualChoice value={eye.manual} onChange={draft.chooseEye} />
        </>
      )}
    </>
  );
}

function GillPart({ draft, coarsePointer }: { draft: PhotoDraft; coarsePointer: boolean }) {
  const { gill } = draft;
  const showCamera = coarsePointer && !gill.photoSrc;
  return (
    <>
      <StepHeading size="h2">{showCamera ? "Buka tutup insang, arahkan ke kotak" : "Bagaimana warna insangnya?"}</StepHeading>
      {draft.unreadablePart === "gill" && <UnreadablePhotoNotice />}
      {gill.photoSrc ? (
        <div className="flex items-center gap-4 rounded-[18px] border border-line bg-surface p-3">
          <span className="relative size-20 shrink-0 overflow-hidden rounded-[12px] bg-ink">
            <Image src={gill.photoSrc} alt="Foto insang" fill sizes="80px" unoptimized className="object-cover" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="font-semibold">Foto insang siap</p>
            <p className="leading-snug text-ink-2">Bandingkan warnanya dengan pilihan di bawah.</p>
          </div>
          <Button variant="quiet" size="md" onClick={draft.retakeGill} className="shrink-0">
            Ulang
          </Button>
        </div>
      ) : draft.preparing === "gill" ? (
        <PreparingPhoto shape="wide" />
      ) : (
        showCamera && <CameraCapture guide="gill" shape="wide" autoStart onCapture={draft.takeGillPhoto} onUploadInstead={draft.takeGillPhoto} />
      )}
      <GillManualChoice value={gill.manual} onChange={draft.chooseGill} />
      <p className="text-[0.9375rem] leading-snug text-ink-2">
        Insang dinilai manusia. AI insang belum dilatih karena foto insang untuk melatihnya belum terkumpul.
      </p>
    </>
  );
}

export function StepPhotos({ draft, subject }: { draft: PhotoDraft; subject: ReactNode }) {
  const coarsePointer = useCoarsePointer();
  const partRef = useRef<HTMLDivElement>(null);
  const focusHeadingIfFocusWasLost = () => {
    if (document.activeElement === document.body || document.activeElement === null) {
      partRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
    }
  };
  return (
    <>
      {subject}
      <Segmented
        label="Bagian ikan yang dinilai"
        value={draft.part}
        onChange={draft.showPart}
        options={[
          { value: "eye", title: <PartTabTitle icon="eye" label="Mata" done={eyeAssessment(draft.eye) !== null} /> },
          { value: "gill", title: <PartTabTitle icon="gill" label="Insang" done={draft.gill.manual !== null} /> },
        ]}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={draft.part}
          ref={partRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: [0.22, 0.8, 0.24, 1] }}
          onAnimationComplete={focusHeadingIfFocusWasLost}
          className="flex flex-col gap-5"
        >
          {draft.part === "eye" ? (
            <EyePart draft={draft} coarsePointer={coarsePointer} />
          ) : (
            <GillPart draft={draft} coarsePointer={coarsePointer} />
          )}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
