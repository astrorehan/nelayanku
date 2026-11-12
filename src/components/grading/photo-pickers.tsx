"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState, type DragEvent, type ReactNode } from "react";
import { SAMPLE_PHOTOS, type SamplePhoto } from "@/ai/sample-photos";
import { Icon } from "@/components/icons/icon";

/* "strip" bergeser ke samping di HP agar hasil tetap terlihat di layar pertama, lalu kembali jadi grid di desktop */
export function SamplePicker({
  selectedId,
  onSelect,
  layout = "grid",
  trailing,
}: {
  selectedId: string | null;
  onSelect: (sample: SamplePhoto) => void;
  layout?: "grid" | "strip";
  trailing?: ReactNode;
}) {
  const strip = layout === "strip";
  return (
    <div
      role="group"
      aria-label="Foto contoh"
      className={clsx(
        strip
          ? "relative -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-2.5 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden"
          : "grid grid-cols-3 gap-2.5 sm:gap-3",
      )}
    >
      {SAMPLE_PHOTOS.map((sample, index) => {
        const selected = sample.id === selectedId;
        return (
          <button
            key={sample.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(sample)}
            className={clsx(
              "group flex flex-col gap-1.5 rounded-[18px] p-1 text-left transition-[transform,box-shadow,background-color] duration-150 active:scale-[0.97]",
              strip && "w-[6.75rem] shrink-0 snap-start lg:w-auto",
              selected ? "bg-surface shadow-raised ring-[3px] ring-sea" : "hover:bg-surface",
            )}
          >
            <span className="relative block aspect-square overflow-hidden rounded-[14px] bg-paper-deep">
              <Image
                src={sample.eyeImage}
                alt={`Contoh ${index + 1}: mata ikan ${sample.speciesName.toLowerCase()}`}
                fill
                unoptimized
                sizes="(min-width: 1024px) 140px, 30vw"
                className="object-cover "
              />
            </span>
            <span className="px-1 pb-0.5 text-[0.9375rem] font-semibold leading-tight">
              Contoh {index + 1}
              <span className="block font-normal text-ink-2">{sample.speciesName}</span>
            </span>
          </button>
        );
      })}
      {trailing}
    </div>
  );
}

/* Satu ubin untuk foto sendiri: di HP browser menawarkan kamera atau galeri */
export function OwnPhotoTile({ onFile, className }: { onFile: (file: File) => void; className?: string }) {
  return (
    <label
      className={clsx(
        "flex w-[6.75rem] shrink-0 snap-start cursor-pointer flex-col gap-1.5 rounded-[18px] p-1 text-left active:scale-[0.97]",
        "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sea",
        className,
      )}
    >
      <input
        aria-label="Pakai foto sendiri"
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file && file.type.startsWith("image/")) onFile(file);
        }}
      />
      <span className="grid aspect-square place-items-center rounded-[14px] border-2 border-dashed border-sea/50 bg-sky-tint text-sea">
        <Icon name="camera" size={28} />
      </span>
      <span className="px-1 pb-0.5 text-[0.9375rem] font-semibold leading-tight">
        Foto sendiri
        <span className="block font-normal text-ink-2">Kamera, galeri</span>
      </span>
    </label>
  );
}

export function PhotoDropzone({
  title = "Tarik foto mata ikan ke sini",
  compact = false,
  onFile,
}: {
  title?: string;
  compact?: boolean;
  onFile: (file: File) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const pick = (files: FileList | null) => {
    const file = files?.[0];
    if (file && file.type.startsWith("image/")) {
      onFile(file);
    }
  };
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    pick(event.dataTransfer.files);
  };
  return (
    <div className="flex flex-col gap-2.5">
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={clsx(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[18px] border-2 border-dashed px-4 text-center transition-colors",
          "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sea",
          compact ? "min-h-24 py-4" : "min-h-32 py-5",
          dragging ? "border-sea bg-sky-tint" : "border-line-strong bg-surface hover:border-sea hover:bg-sky-tint/50",
        )}
      >
        <input aria-label="Unggah foto mata" type="file" accept="image/*" className="sr-only" onChange={(event) => pick(event.target.files)} />
        <Icon name="upload" size={28} />
        <span className="font-semibold">{title}</span>
        <span className="text-ink-2">atau klik untuk memilih file</span>
      </label>
      <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-surface px-5 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sea sm:hidden">
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => pick(event.target.files)} />
        <Icon name="camera" size={20} />
        Pakai kamera
      </label>
    </div>
  );
}
