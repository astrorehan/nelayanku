"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { TextArea, TextField } from "@/components/ui/fields";
import type { Product } from "@/data/types";
import { preparePhoto } from "@/lib/image";
import { useProductVoice } from "./use-product-voice";

export function ProductStep({
  product,
  onChange,
}: {
  product: Product;
  onChange: (product: Product) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [photoMessage, setPhotoMessage] = useState("");
  const voice = useProductVoice((text) =>
    onChange({ ...product, spokenDescription: text }),
  );
  const photo = async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      setPhotoMessage("Pilih foto JPG, PNG, atau WebP, maksimal 10 MB");
      return;
    }
    try {
      const prepared = await preparePhoto(file);
      URL.revokeObjectURL(prepared.previewUrl);
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(prepared.storedBlob);
      });
      onChange({ ...product, photoDataUrl: dataUrl });
      setPhotoMessage("Foto disimpan di perangkat ini");
    } catch {
      setPhotoMessage("Foto belum terbaca. Coba gambar lain.");
    }
  };
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="type-h2">Produk apa yang dibuat?</h2>
        <p className="mt-2 text-ink-2">
          Ceritakan lewat suara atau ketik. Nama, bahan, dan berat tetap Anda
          periksa sendiri.
        </p>
      </div>
      <TextArea
        label="Keterangan produk"
        value={product.spokenDescription}
        onChange={(event) =>
          onChange({ ...product, spokenDescription: event.target.value })
        }
        placeholder="Misalnya: ikan asin tongkol, 250 gram, dengan garam"
      />
      <Button
        variant="quiet"
        icon="microphone"
        onClick={voice.toggle}
        aria-pressed={voice.listening}
      >
        {voice.listening ? "Selesai bicara" : "Ucapkan keterangan"}
      </Button>
      <p className="text-sm text-ink-2">
        Pengenalan suara memakai layanan browser dan mungkin perlu internet
      </p>
      {voice.message && <p role="status">{voice.message}</p>}
      <TextField
        label="Nama produk"
        value={product.name}
        onChange={(event) =>
          onChange({
            ...product,
            name: event.target.value,
            label: { ...product.label, productName: event.target.value },
          })
        }
        required
      />
      <TextField
        label="Merek"
        value={product.brand}
        onChange={(event) =>
          onChange({ ...product, brand: event.target.value })
        }
      />
      <TextField
        label="Komposisi, dari yang terbanyak"
        value={product.label.ingredients.join(",")}
        onChange={(event) =>
          onChange({
            ...product,
            label: {
              ...product.label,
              ingredients: event.target.value.split(","),
            },
          })
        }
        hint="Pisahkan dengan koma. Misalnya: ikan tongkol, garam"
      />
      <TextField
        label="Berat bersih per kemasan"
        type="number"
        inputMode="numeric"
        min={1}
        step={1}
        value={product.run.packNetWeightGrams || ""}
        suffix="gram"
        onChange={(event) => {
          const grams = Number(event.target.value);
          onChange({
            ...product,
            run: { ...product.run, packNetWeightGrams: grams },
            label: { ...product.label, netWeightGrams: grams },
          });
        }}
      />
      <div className="flex flex-col gap-3 border-t border-line pt-4">
        <p className="font-medium">Foto produk · opsional</p>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          aria-label="Unggah foto produk"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void photo(file);
            event.target.value = "";
          }}
        />
        {product.photoDataUrl && (
          <Image
            src={product.photoDataUrl}
            width={240}
            height={180}
            alt={`Foto ${product.name || "produk olahan"}`}
            unoptimized
            className="max-h-48 w-full rounded-[12px] object-contain"
          />
        )}
        <Button
          variant="quiet"
          icon="camera"
          onClick={() => fileInput.current?.click()}
        >
          {product.photoDataUrl ? "Ganti foto" : "Tambah foto"}
        </Button>
        {photoMessage && <p role="status">{photoMessage}</p>}
      </div>
    </div>
  );
}
