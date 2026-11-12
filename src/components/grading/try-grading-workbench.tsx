"use client";

import clsx from "clsx";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { freshnessModel } from "@/ai/model-instance";
import { assessImageQuality, type QualityProblem } from "@/ai/image-quality";
import {
  dominantEyeClass,
  EYE_MANUAL_PROBABILITIES,
  GILL_MANUAL_PROBABILITIES,
  type EyeManualOption,
  type GillManualOption,
  type SamplePhoto,
} from "@/ai/sample-photos";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { CountUp } from "@/components/ui/meters";
import { Notice, Pill } from "@/components/ui/surface";
import {
  assessFreshness,
  type EyeProbabilities,
  type OdorOption,
  type TextureOption,
} from "@/domain/freshness-score";
import {
  EYE_CLASS_LABEL,
  GRADE_LABEL,
  QUALITY_PROBLEM_LABEL,
} from "@/content/labels";
import { preparePhoto } from "@/lib/image";
import { formatScore } from "@/lib/format";
import {
  EyeManualChoice,
  GillManualChoice,
  OdorChoice,
  TextureChoice,
} from "./human-inputs";
import { OwnPhotoTile, PhotoDropzone, SamplePicker } from "./photo-pickers";
import { ScanPhoto } from "./scan-photo";
import { ParameterBars, ScoreHeadline } from "./score-summary";

type PhotoState =
  | { kind: "none" }
  | { kind: "sample"; sample: SamplePhoto }
  | {
      kind: "upload";
      previewUrl: string;
      problems: QualityProblem[];
      overridden: boolean;
    };

const DATASET_CREDIT =
  "Foto contoh dari dataset FFE (Prasetyo dkk., 2022), lisensi CC BY 4.0, dipotong persegi. Foto Anda tidak dikirim ke server.";

function scrollToId(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Ringkasan hasil yang ikut turun di HP, supaya pengaruh isian ke skor tetap terlihat */
function useInView<T extends Element>(active: boolean) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const element = ref.current;
    if (!active || !element) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [active]);
  return [ref, inView] as const;
}

export function TryGradingWorkbench() {
  const [photo, setPhoto] = useState<PhotoState>({ kind: "none" });
  const [modelEye, setModelEye] = useState<EyeProbabilities | null>(null);
  const [assessing, setAssessing] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [fileError, setFileError] = useState("");
  const [eyeManual, setEyeManual] = useState<EyeManualOption | null>(null);
  const [gill, setGill] = useState<GillManualOption | null>(null);
  const [odor, setOdor] = useState<OdorOption | null>(null);
  const [texture, setTexture] = useState<TextureOption | null>(null);
  const requestId = useRef(0);
  const [headlineRef, headlineInView] = useInView<HTMLDivElement>(
    photo.kind !== "none",
  );

  const chooseSample = async (sample: SamplePhoto) => {
    const id = ++requestId.current;
    setPhoto({ kind: "sample", sample });
    setModelEye(null);
    setEyeManual(null);
    setGill(sample.exampleHumanInputs.gill);
    setOdor(sample.exampleHumanInputs.odor);
    setTexture(sample.exampleHumanInputs.texture);
    setAssessing(true);
    const probabilities = await freshnessModel.assessEye({
      kind: "sample",
      sampleId: sample.id,
    });
    if (id === requestId.current) {
      setModelEye(probabilities);
      setAssessing(false);
    }
  };

  const chooseFile = async (file: File) => {
    const id = ++requestId.current;
    setPreparing(true);
    setFileError("");
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error();
      const prepared = await preparePhoto(file);
      if (id !== requestId.current) {
        return;
      }
      setPhoto({
        kind: "upload",
        previewUrl: prepared.previewUrl,
        problems: assessImageQuality(prepared.pixels).problems,
        overridden: false,
      });
      setModelEye(null);
      setAssessing(false);
      setEyeManual(null);
      setGill(null);
      setOdor(null);
      setTexture(null);
    } catch {
      setFileError(
        "Foto belum terbaca. Pilih JPG, PNG, atau WebP, maksimal 10 MB.",
      );
    } finally {
      setPreparing(false);
    }
  };

  const eyeProbabilities =
    modelEye ?? (eyeManual ? EYE_MANUAL_PROBABILITIES[eyeManual] : null);
  const assessment = useMemo(
    () =>
      eyeProbabilities && gill && odor && texture
        ? assessFreshness({
            eye: eyeProbabilities,
            gill: GILL_MANUAL_PROBABILITIES[gill],
            odor,
            texture,
          })
        : null,
    [eyeProbabilities, gill, odor, texture],
  );
  const blockedByQuality =
    photo.kind === "upload" && photo.problems.length > 0 && !photo.overridden;
  const aiClass = modelEye ? dominantEyeClass(modelEye).eyeClass : null;
  const showBar = photo.kind !== "none" && !blockedByQuality && !headlineInView;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-8">
      <section
        aria-labelledby="pilih-foto"
        className="flex min-w-0 flex-col gap-3 lg:sticky lg:top-24 lg:gap-4"
      >
        <h2 id="pilih-foto" className="type-h3">
          1. Pilih foto mata
        </h2>
        <SamplePicker
          layout="strip"
          selectedId={photo.kind === "sample" ? photo.sample.id : null}
          onSelect={chooseSample}
          trailing={<OwnPhotoTile onFile={chooseFile} className="lg:hidden" />}
        />
        <div className="hidden lg:block">
          <PhotoDropzone onFile={chooseFile} />
        </div>
        {fileError && <Notice tone="danger" title={fileError} />}
        <p className="hidden text-[0.875rem] leading-snug text-ink-2 lg:block">
          {DATASET_CREDIT}
        </p>
      </section>

      <section aria-labelledby="hasil" className="min-w-0">
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5 sm:px-7 sm:pt-6">
            <h2 id="hasil" className="type-h3">
              2. Hasil
            </h2>
            <span className="flex items-center gap-2 text-sm text-ink-2">
              <span className="docket-eye" aria-hidden />
              Model simulasi · di browser
            </span>
          </div>

          {photo.kind === "none" ? (
            <div className="m-5 flex flex-col items-center gap-3 rounded-[22px] bg-paper px-6 py-10 text-center sm:m-7 sm:py-14">
              <span className="grid size-16 place-items-center rounded-full bg-sky-tint text-sea">
                <Icon name="eye" size={32} />
              </span>
              <p className="type-h3">Belum ada foto</p>
              <p className="max-w-xs text-ink-2">
                {preparing
                  ? "Menyiapkan foto…"
                  : "Pilih satu foto mata di atas. Penilaiannya muncul di sini dalam hitungan detik."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 px-5 pt-4 sm:grid-cols-[13rem_minmax(0,1fr)] sm:items-center sm:gap-6 sm:px-7 sm:pt-5">
              <ScanPhoto
                src={
                  photo.kind === "sample"
                    ? photo.sample.eyeImage
                    : photo.previewUrl
                }
                alt="Foto mata ikan yang sedang dinilai"
                scanning={assessing}
                className="mx-auto w-full max-w-[15rem] sm:max-w-none"
              />
              <div
                ref={headlineRef}
                aria-live="polite"
                className="relative z-10 mx-2 -mt-12 rounded-[22px] bg-surface p-4 shadow-floating sm:mx-0 sm:mt-0 sm:p-0 sm:shadow-none"
              >
                {assessing && (
                  <p className="flex min-h-16 items-center gap-2 font-semibold">
                    <Icon name="sync" size={20} className="animate-spin" />
                    Menilai mata ikan…
                  </p>
                )}
                {!assessing && assessment && (
                  <ScoreHeadline
                    grade={assessment.grade}
                    finalScore={assessment.finalScore}
                    stampKey={`${assessment.grade}-${photo.kind === "sample" ? photo.sample.id : "upload"}`}
                  />
                )}
                {!assessing && !assessment && (
                  <p className="flex min-h-16 items-center font-semibold text-ink-2">
                    {blockedByQuality
                      ? "Periksa foto dulu."
                      : "Lengkapi penilaian di bawah untuk melihat skor."}
                  </p>
                )}
                <p className="sr-only">
                  {assessment
                    ? `Hasil: mutu ${GRADE_LABEL[assessment.grade]}, skor ${formatScore(assessment.finalScore)} dari 9.`
                    : ""}
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-6 p-5 sm:p-7">
            {photo.kind === "sample" && modelEye && aiClass && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[18px] bg-paper px-4 py-3">
                <span>
                  Label asli dataset:{" "}
                  <b>
                    {EYE_CLASS_LABEL[
                      photo.sample.trueEyeClass
                    ].title.toLowerCase()}
                  </b>
                </span>
                <span>
                  Hasil simulasi:{" "}
                  <b>{EYE_CLASS_LABEL[aiClass].title.toLowerCase()}</b>
                </span>
                <Pill
                  tone={
                    aiClass === photo.sample.trueEyeClass
                      ? "success"
                      : "warning"
                  }
                  icon={
                    aiClass === photo.sample.trueEyeClass ? "check" : "warning"
                  }
                >
                  {aiClass === photo.sample.trueEyeClass ? "Cocok" : "Berbeda"}
                </Pill>
              </div>
            )}

            {photo.kind === "upload" && (
              <div className="flex flex-col gap-3">
                {photo.problems.map((problem) => (
                  <Notice key={problem} tone="warning" title="Periksa foto ini">
                    {QUALITY_PROBLEM_LABEL[problem]}
                  </Notice>
                ))}
                {blockedByQuality ? (
                  <Button
                    variant="quiet"
                    size="md"
                    className="self-start"
                    onClick={() => setPhoto({ ...photo, overridden: true })}
                  >
                    Tetap pakai foto ini
                  </Button>
                ) : (
                  <Notice tone="info" title="Mata dinilai manusia di demo ini">
                    Model terlatih belum dipasang. Di demo ini, pilih keadaan
                    mata sesuai pengamatan Anda.
                  </Notice>
                )}
              </div>
            )}

            {assessment && (
              <div id="rincian-nilai" className="scroll-mt-24">
                <ParameterBars
                  parameters={assessment.parameters}
                  sources={{
                    eye: modelEye ? "AI" : "manusia",
                    gill: "manusia",
                    odor: "manusia",
                    texture: "manusia",
                  }}
                  notes={{
                    eye:
                      modelEye && aiClass
                        ? EYE_CLASS_LABEL[aiClass].reason.toLowerCase()
                        : undefined,
                  }}
                />
              </div>
            )}

            {photo.kind !== "none" && !blockedByQuality && !assessing && (
              <div
                id="isian-manusia"
                className="flex scroll-mt-24 flex-col gap-6 border-t border-line pt-6"
              >
                {photo.kind === "sample" && (
                  <p className="rounded-[18px] bg-sky-tint px-4 py-3 text-sea-deep">
                    Insang, bau, dan tekstur berisi isian contoh. Ubah untuk
                    melihat pengaruhnya ke skor.
                  </p>
                )}
                {photo.kind === "upload" && (
                  <EyeManualChoice value={eyeManual} onChange={setEyeManual} />
                )}
                <GillManualChoice value={gill} onChange={setGill} />
                <OdorChoice value={odor} onChange={setOdor} />
                <TextureChoice value={texture} onChange={setTexture} />
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-line pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-ink-2">
                  Skor gaya SNI 2729: rata-rata 4 hal, skala 1 sampai 9.
                </p>
                <Link
                  href="/tentang/model"
                  className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-sea underline underline-offset-4"
                >
                  Cara AI menilai
                  <Icon name="chevronRight" size={18} />
                </Link>
              </div>
              <p className="text-[0.875rem] leading-snug text-ink-2 lg:hidden">
                {DATASET_CREDIT}
              </p>
            </div>
          </div>
        </div>

        <div
          inert={!showBar}
          className={clsx(
            "sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 mt-4 transition-[opacity,transform] duration-200 lg:hidden",
            showBar
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-3 opacity-0",
          )}
        >
          <div
            role="region"
            aria-label="Ringkasan hasil"
            className="mx-auto flex max-w-md items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-2 text-white shadow-floating"
          >
            {assessment && !assessing ? (
              <>
                <GradeStamp grade={assessment.grade} size="sm" />
                <p className="flex min-w-0 flex-1 items-baseline gap-1.5">
                  <CountUp
                    value={assessment.finalScore}
                    format={formatScore}
                    className="type-money text-[1.375rem]"
                  />
                  <span className="truncate text-sm text-white/70">
                    dari 9, {GRADE_LABEL[assessment.grade].toLowerCase()}
                  </span>
                </p>
                <Button
                  variant="inverted"
                  size="md"
                  className="min-h-11 shrink-0 px-4"
                  onClick={() => scrollToId("rincian-nilai")}
                >
                  Rincian
                </Button>
              </>
            ) : (
              <>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10">
                  <Icon
                    name={assessing ? "sync" : "edit"}
                    size={18}
                    className={assessing ? "animate-spin" : undefined}
                  />
                </span>
                <p className="min-w-0 flex-1 truncate font-semibold">
                  {assessing ? "Menilai mata ikan…" : "Lengkapi penilaian"}
                </p>
                {!assessing && (
                  <Button
                    variant="inverted"
                    size="md"
                    className="min-h-11 shrink-0 px-4"
                    onClick={() => scrollToId("isian-manusia")}
                  >
                    Isi
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
