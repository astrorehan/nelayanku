"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
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
import { PhotoDropzone, SamplePicker } from "./photo-pickers";
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
  const resultRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  const revealResult = () => {
    if (window.matchMedia("(max-width: 1023px)").matches) {
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      );
    }
  };

  const chooseSample = async (sample: SamplePhoto) => {
    const id = ++requestId.current;
    setPhoto({ kind: "sample", sample });
    setModelEye(null);
    setEyeManual(null);
    setGill(sample.exampleHumanInputs.gill);
    setOdor(sample.exampleHumanInputs.odor);
    setTexture(sample.exampleHumanInputs.texture);
    setAssessing(true);
    revealResult();
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
      revealResult();
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

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start lg:gap-8">
      <section
        aria-labelledby="pilih-foto"
        className="flex flex-col gap-4 lg:sticky lg:top-24"
      >
        <h2 id="pilih-foto" className="type-h3">
          1. Pilih foto contoh
        </h2>
        <SamplePicker
          selectedId={photo.kind === "sample" ? photo.sample.id : null}
          onSelect={chooseSample}
        />
        <PhotoDropzone onFile={chooseFile} />
        {fileError && <Notice tone="danger" title={fileError} />}
        <p className="text-[0.875rem] leading-snug text-ink-2">
          Foto contoh dari dataset FFE (Prasetyo dkk., 2022), lisensi CC BY 4.0,
          dipotong persegi. Foto Anda tidak dikirim ke server.
        </p>
      </section>

      <section ref={resultRef} aria-labelledby="hasil" className="scroll-mt-20">
        <div className="weighing-docket flex flex-col gap-6 p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="hasil" className="type-h3">
              2. Hasil
            </h2>
            <span className="flex items-center gap-2 text-sm text-ink-2">
              <span className="docket-eye" aria-hidden />
              Model simulasi · di browser
            </span>
          </div>

          {photo.kind === "none" && (
            <div className="flex flex-col items-center gap-3 rounded-[18px] border border-dashed border-line-strong bg-paper px-6 py-14 text-center">
              <Icon name="eye" size={40} className="text-ink-2" />
              <p className="type-h3">Belum ada foto</p>
              <p className="max-w-xs text-ink-2">
                {preparing
                  ? "Menyiapkan foto…"
                  : "Pilih satu foto contoh. Penilaiannya muncul di sini dalam hitungan detik."}
              </p>
            </div>
          )}

          {photo.kind !== "none" && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
              <ScanPhoto
                src={
                  photo.kind === "sample"
                    ? photo.sample.eyeImage
                    : photo.previewUrl
                }
                alt="Foto mata ikan yang sedang dinilai"
                scanning={assessing}
                className="w-40 sm:w-full"
              />
              <div aria-live="polite">
                {assessing && (
                  <p className="flex items-center gap-2 font-semibold">
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
                  <p className="font-semibold text-ink-2">
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

          {photo.kind === "sample" && modelEye && aiClass && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-line py-4">
              <span>
                Label asli dataset:{" "}
                <b>
                  {EYE_CLASS_LABEL[
                    photo.sample.trueEyeClass
                  ].title.toLowerCase()}
                </b>
              </span>
              <span aria-hidden className="text-ink-3">
                ·
              </span>
              <span>
                Hasil simulasi:{" "}
                <b>{EYE_CLASS_LABEL[aiClass].title.toLowerCase()}</b>
              </span>
              <Pill
                tone={
                  aiClass === photo.sample.trueEyeClass ? "success" : "warning"
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
                  Model terlatih belum dipasang. Di demo ini, pilih keadaan mata
                  sesuai pengamatan Anda.
                </Notice>
              )}
            </div>
          )}

          {assessment && (
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
              className="border-t border-line pt-5"
            />
          )}

          {photo.kind !== "none" && !blockedByQuality && !assessing && (
            <div className="flex flex-col gap-6 border-t border-line pt-5">
              {photo.kind === "sample" && (
                <p className="text-ink-2">
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

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <p className="text-ink-2">
              Skor gaya SNI 2729: rata-rata 4 hal, skala 1 sampai 9.
            </p>
            <Link
              href="/tentang/model"
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold underline underline-offset-4"
            >
              Cara AI menilai
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
