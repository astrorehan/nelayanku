import type { PixelBuffer } from "@/ai/image-quality";

export const QUALITY_SAMPLE_SIZE = 160;
export const STORED_PHOTO_MAX_SIDE = 1280;

export interface PreparedPhoto {
  previewUrl: string;
  pixels: PixelBuffer;
  storedBlob: Blob;
}

function canvasOf(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas 2D is not available");
  }
  return { canvas, context };
}

export async function preparePhoto(file: Blob): Promise<PreparedPhoto> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const sampler = canvasOf(QUALITY_SAMPLE_SIZE, QUALITY_SAMPLE_SIZE);
  sampler.context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    QUALITY_SAMPLE_SIZE,
    QUALITY_SAMPLE_SIZE,
  );
  const imageData = sampler.context.getImageData(0, 0, QUALITY_SAMPLE_SIZE, QUALITY_SAMPLE_SIZE);
  const scale = Math.min(1, STORED_PHOTO_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const store = canvasOf(Math.round(bitmap.width * scale), Math.round(bitmap.height * scale));
  store.context.drawImage(bitmap, 0, 0, store.canvas.width, store.canvas.height);
  bitmap.close();
  const storedBlob = await new Promise<Blob>((resolve, reject) =>
    store.canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not compress photo"))), "image/jpeg", 0.82),
  );
  return {
    previewUrl: URL.createObjectURL(storedBlob),
    pixels: { width: imageData.width, height: imageData.height, data: imageData.data },
    storedBlob,
  };
}

export async function storedPhotoDataUrl(file: Blob): Promise<string> {
  const prepared = await preparePhoto(file);
  URL.revokeObjectURL(prepared.previewUrl);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Foto belum terbaca"));
    reader.readAsDataURL(prepared.storedBlob);
  });
}
