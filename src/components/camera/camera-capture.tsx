"use client";

import clsx from "clsx";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { assessImageQuality, type QualityProblem } from "@/ai/image-quality";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/surface";
import { QUALITY_PROBLEM_LABEL } from "@/content/labels";

type CameraState = "idle" | "starting" | "live" | "denied" | "unavailable";

const SAMPLE_EVERY_MS = 350;
const STEADY_FRAMES_TO_CAPTURE = 3;
const SAMPLE_SIZE = 160;

interface TorchCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

export function CameraCapture({
  guide,
  autoStart,
  onCapture,
  onUploadInstead,
}: {
  guide: "eye" | "gill";
  autoStart: boolean;
  onCapture: (photo: Blob) => void;
  onUploadInstead: (file: File) => void;
}) {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const capturingRef = useRef(false);
  const [state, setState] = useState<CameraState>("idle");
  const [problems, setProblems] = useState<QualityProblem[] | null>(null);
  const [steady, setSteady] = useState(0);
  const [torchAvailable, setTorchAvailable] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unavailable");
      return;
    }
    setState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      const capabilities = stream.getVideoTracks()[0]?.getCapabilities?.() as TorchCapabilities | undefined;
      setTorchAvailable(Boolean(capabilities?.torch));
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setState("live");
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      setState(name === "NotAllowedError" || name === "SecurityError" ? "denied" : "unavailable");
    }
  }, []);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || capturingRef.current || video.videoWidth === 0) {
      return;
    }
    capturingRef.current = true;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    globalThis.navigator?.vibrate?.(30);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          stop();
          onCapture(blob);
        }
        capturingRef.current = false;
      },
      "image/jpeg",
      0.9,
    );
  }, [onCapture, stop]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) {
      return;
    }
    const next = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] });
      setTorchOn(next);
    } catch {
      setTorchAvailable(false);
    }
  };

  useEffect(() => {
    if (autoStart) {
      const timer = window.setTimeout(start, 0);
      return () => {
        window.clearTimeout(timer);
        stop();
      };
    }
    return stop;
  }, [autoStart, start, stop]);

  useEffect(() => {
    if (state !== "live") {
      return;
    }
    const sampler = document.createElement("canvas");
    sampler.width = SAMPLE_SIZE;
    sampler.height = SAMPLE_SIZE;
    const context = sampler.getContext("2d", { willReadFrequently: true });
    let goodFrames = 0;
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video || !context || video.readyState < 2 || video.videoWidth === 0) {
        return;
      }
      const side = Math.min(video.videoWidth, video.videoHeight) * 0.6;
      context.drawImage(
        video,
        (video.videoWidth - side) / 2,
        (video.videoHeight - side) / 2,
        side,
        side,
        0,
        0,
        SAMPLE_SIZE,
        SAMPLE_SIZE,
      );
      const report = assessImageQuality(context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE));
      goodFrames = report.problems.length === 0 ? goodFrames + 1 : 0;
      setProblems(report.problems);
      setSteady(goodFrames);
      if (goodFrames >= STEADY_FRAMES_TO_CAPTURE) {
        capture();
      }
    }, SAMPLE_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [state, capture]);

  const uploadInput = (
    <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-line-strong bg-surface px-4 font-bold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink">
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            stop();
            onUploadInstead(file);
          }
        }}
      />
      <Icon name="upload" size={20} />
      Unggah foto
    </label>
  );

  if (state === "denied" || state === "unavailable") {
    return (
      <div className="flex flex-col gap-3">
        <Notice tone="info" title={state === "denied" ? "Kamera tidak diizinkan" : "Kamera tidak tersedia"}>
          Tidak apa-apa. Unggah foto dari galeri, hasilnya sama.
        </Notice>
        {uploadInput}
      </div>
    );
  }

  const statusText =
    state !== "live"
      ? "Menyalakan kamera…"
      : problems && problems.length > 0
        ? QUALITY_PROBLEM_LABEL[problems[0]]
        : steady > 0
          ? "Jelas. Tahan sebentar…"
          : "Arahkan ke panduan";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[22px] bg-ink sm:aspect-[4/3]">
        {state === "idle" ? (
          <div className="absolute inset-0 grid place-items-center p-6">
            <Button size="lg" icon="camera" onClick={start}>
              Buka kamera
            </Button>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="absolute inset-0 size-full object-cover" />
            <div
              aria-hidden
              className={clsx(
                "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-[3px] border-dashed border-white/90 shadow-[0_0_0_9999px_rgb(19_40_58/0.42)]",
                guide === "eye" ? "aspect-square w-[58%] rounded-full" : "aspect-[3/2] w-[76%] rounded-[24px]",
              )}
            />
            <p
              aria-live="polite"
              className="absolute inset-x-3 bottom-3 flex min-h-14 items-center gap-3 rounded-[16px] bg-surface/95 px-4 py-2 font-bold text-ink shadow-raised"
            >
              <Icon name={problems && problems.length > 0 ? "warning" : "eye"} size={22} className="shrink-0" />
              <span className="flex-1 leading-snug">{statusText}</span>
              {torchAvailable && (
                <Button size="md" variant={torchOn ? "primary" : "quiet"} icon="flashlight" onClick={toggleTorch}>
                  {torchOn ? "Matikan senter" : "Senter"}
                </Button>
              )}
            </p>
          </>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        {uploadInput}
        <button
          type="button"
          onClick={capture}
          disabled={state !== "live"}
          aria-label="Potret sekarang"
          className="relative grid size-[4.75rem] shrink-0 place-items-center rounded-full border-4 border-ink bg-surface transition-transform active:scale-95 disabled:opacity-40"
        >
          <span className="size-14 rounded-full bg-ink" />
          {state === "live" && !reduceMotion && (
            <svg viewBox="0 0 80 80" className="absolute -inset-1.5 -rotate-90" aria-hidden>
              <motion.circle
                cx="40"
                cy="40"
                r="37"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 37}
                animate={{ strokeDashoffset: 2 * Math.PI * 37 * (1 - steady / STEADY_FRAMES_TO_CAPTURE) }}
                transition={{ duration: 0.3 }}
              />
            </svg>
          )}
        </button>
      </div>
      <p className="text-center text-ink-2">Memotret otomatis saat gambar jelas. Tombol bulat untuk memotret sendiri.</p>
    </div>
  );
}
