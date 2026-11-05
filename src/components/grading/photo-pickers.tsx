"use client";

import clsx from "clsx";
import Image from "next/image";
import { useState, type DragEvent } from "react";
import { SAMPLE_PHOTOS, type SamplePhoto } from "@/ai/sample-photos";
import { Icon } from "@/components/icons/icon";

export function SamplePicker({ selectedId, onSelect }: { selectedId: string | null; onSelect: (sample: SamplePhoto) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {SAMPLE_PHOTOS.map((sample, index) => {
        const selected = sample.id === selectedId;
        return (
          <button
            key={sample.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(sample)}
            className={clsx(
              "group flex flex-col gap-1.5 rounded-[16px] p-1 text-left transition-[transform,box-shadow] duration-150 active:scale-[0.97]",
              selected ? "bg-surface shadow-raised ring-[3px] ring-ink" : "hover:bg-surface",
            )}
          >
            <span className="relative block aspect-square overflow-hidden rounded-[12px] bg-paper-deep">
              <Image
                src={sample.eyeImage}
                alt={`Contoh ${index + 1}: mata ikan ${sample.speciesName.toLowerCase()}`}
                fill
                sizes="(min-width: 1024px) 140px, 30vw"
                className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
              />
            </span>
            <span className="px-1 pb-0.5 text-[0.9375rem] font-semibold leading-tight">
              Contoh {index + 1}
              <span className="block font-normal text-ink-2">{sample.speciesName}</span>
            </span>
          </button>
        );
      })}
    </div>
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
          "has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink",
          compact ? "min-h-24 py-4" : "min-h-32 py-5",
          dragging ? "border-ink bg-surface" : "border-line-strong bg-paper-deep/60 hover:border-ink",
        )}
      >
        <input type="file" accept="image/*" className="sr-only" onChange={(event) => pick(event.target.files)} />
        <Icon name="upload" size={28} />
        <span className="font-semibold">{title}</span>
        <span className="text-ink-2">atau klik untuk memilih file</span>
      </label>
      <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-line-strong bg-surface px-4 font-semibold has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink sm:hidden">
        <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => pick(event.target.files)} />
        <Icon name="camera" size={20} />
        Pakai kamera
      </label>
    </div>
  );
}
