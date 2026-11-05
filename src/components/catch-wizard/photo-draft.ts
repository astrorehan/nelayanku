"use client";

import { useRef, useState } from "react";
import { assessImageQuality, type QualityProblem } from "@/ai/image-quality";
import { freshnessModel } from "@/ai/model-instance";
import {
  EYE_MANUAL_PROBABILITIES,
  GILL_MANUAL_PROBABILITIES,
  type EyeManualOption,
  type GillManualOption,
  type SamplePhoto,
} from "@/ai/sample-photos";
import type { AssessmentSource } from "@/data/types";
import type { EyeProbabilities, GillProbabilities } from "@/domain/freshness-score";
import { preparePhoto } from "@/lib/image";

export type PhotoPart = "eye" | "gill";

export type EyePhoto =
  | { kind: "sample"; sample: SamplePhoto }
  | { kind: "taken"; src: string; problems: QualityProblem[]; keptAnyway: boolean };

export interface EyeDraft {
  photo: EyePhoto | null;
  modelResult: EyeProbabilities | null;
  assessing: boolean;
  manual: EyeManualOption | null;
}

export interface GillDraft {
  photoSrc: string | null;
  manual: GillManualOption | null;
}

export interface PartAssessment<T> {
  probabilities: T;
  source: AssessmentSource;
}

const EMPTY_EYE: EyeDraft = { photo: null, modelResult: null, assessing: false, manual: null };
const EMPTY_GILL: GillDraft = { photoSrc: null, manual: null };
const PAUSE_AFTER_MODEL_RESULT_MS = 1100;
const PAUSE_AFTER_CHOICE_MS = 380;

const pause = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export function eyePhotoSrc(photo: EyePhoto): string {
  return photo.kind === "sample" ? photo.sample.eyeImage : photo.src;
}

export function eyeAwaitsRetakeDecision(eye: EyeDraft): boolean {
  return eye.photo?.kind === "taken" && eye.photo.problems.length > 0 && !eye.photo.keptAnyway;
}

export function eyeAssessment(eye: EyeDraft): PartAssessment<EyeProbabilities> | null {
  if (eye.modelResult) {
    return { probabilities: eye.modelResult, source: "model" };
  }
  return eye.manual ? { probabilities: EYE_MANUAL_PROBABILITIES[eye.manual], source: "person" } : null;
}

export function gillAssessment(gill: GillDraft): PartAssessment<GillProbabilities> | null {
  return gill.manual ? { probabilities: GILL_MANUAL_PROBABILITIES[gill.manual], source: "person" } : null;
}

export function photoStepHint(eye: EyeDraft, gill: GillDraft, coarsePointer: boolean): string | null {
  if (eye.assessing) {
    return "Menilai mata…";
  }
  if (!eye.photo) {
    return coarsePointer ? "Potret mata ikan dulu" : "Pilih foto contoh atau unggah foto mata";
  }
  if (eyeAwaitsRetakeDecision(eye)) {
    return "Potret ulang atau tetap pakai foto ini";
  }
  if (!eyeAssessment(eye)) {
    return "Pilih keadaan mata dulu";
  }
  return gill.manual ? null : "Pilih warna insang dulu";
}

export function usePhotoDraft() {
  const [eye, setEye] = useState<EyeDraft>(EMPTY_EYE);
  const [gill, setGill] = useState<GillDraft>(EMPTY_GILL);
  const [part, setPart] = useState<PhotoPart>("eye");
  const [preparing, setPreparing] = useState<PhotoPart | null>(null);
  const [unreadablePart, setUnreadablePart] = useState<PhotoPart | null>(null);
  const eyeRequest = useRef(0);

  const moveToGillAfter = async (request: number, milliseconds: number) => {
    await pause(milliseconds);
    if (request === eyeRequest.current) {
      setPart("gill");
    }
  };

  const prepare = async (target: PhotoPart, file: Blob) => {
    setPreparing(target);
    setUnreadablePart(null);
    try {
      return await preparePhoto(file);
    } catch {
      setUnreadablePart(target);
      return null;
    } finally {
      setPreparing(null);
    }
  };

  return {
    eye,
    gill,
    part,
    preparing,
    unreadablePart,
    showPart: setPart,
    async pickSample(sample: SamplePhoto) {
      const request = ++eyeRequest.current;
      setEye({ ...EMPTY_EYE, photo: { kind: "sample", sample }, assessing: true });
      try {
        const result = await freshnessModel.assessEye({ kind: "sample", sampleId: sample.id });
        if (request !== eyeRequest.current) {
          return;
        }
        setEye((current) => ({ ...current, assessing: false, modelResult: result }));
        await moveToGillAfter(request, PAUSE_AFTER_MODEL_RESULT_MS);
      } catch {
        if (request === eyeRequest.current) {
          setEye((current) => ({ ...current, assessing: false }));
        }
      }
    },
    async takeEyePhoto(file: Blob) {
      const request = ++eyeRequest.current;
      const prepared = await prepare("eye", file);
      if (!prepared || request !== eyeRequest.current) {
        return;
      }
      const problems = assessImageQuality(prepared.pixels).problems;
      setEye({ ...EMPTY_EYE, photo: { kind: "taken", src: prepared.previewUrl, problems, keptAnyway: false } });
    },
    keepEyePhotoAnyway() {
      setEye((current) =>
        current.photo?.kind === "taken" ? { ...current, photo: { ...current.photo, keptAnyway: true } } : current,
      );
    },
    retakeEye() {
      eyeRequest.current++;
      setEye(EMPTY_EYE);
    },
    chooseEye(option: EyeManualOption) {
      const request = ++eyeRequest.current;
      setEye((current) => ({ ...current, manual: option }));
      void moveToGillAfter(request, PAUSE_AFTER_CHOICE_MS);
    },
    async takeGillPhoto(file: Blob) {
      const prepared = await prepare("gill", file);
      if (prepared) {
        setGill((current) => ({ ...current, photoSrc: prepared.previewUrl }));
      }
    },
    retakeGill() {
      setGill((current) => ({ ...current, photoSrc: null }));
    },
    chooseGill(option: GillManualOption) {
      setGill((current) => ({ ...current, manual: option }));
    },
  };
}

export type PhotoDraft = ReturnType<typeof usePhotoDraft>;
