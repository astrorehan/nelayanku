import type { ProductCaptions } from "@/data/types";
import { readCaptions, type SalesCopyInput } from "@/domain/sales-copy";

export type AiCopyOutcome =
  | { ok: true; captions: ProductCaptions }
  | { ok: false; reason: "offline" | "unavailable" | "busy" | "rejected" | "failed" };

export async function requestAiCaptions(input: SalesCopyInput): Promise<AiCopyOutcome> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return { ok: false, reason: "offline" };
  try {
    const response = await fetch("/api/studio/teks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(40_000),
    });
    if (response.status === 503) return { ok: false, reason: "unavailable" };
    if (response.status === 429) return { ok: false, reason: "busy" };
    if (response.status === 422) return { ok: false, reason: "rejected" };
    if (!response.ok) return { ok: false, reason: "failed" };
    const captions = readCaptions(((await response.json()) as { captions?: unknown }).captions);
    return captions ? { ok: true, captions } : { ok: false, reason: "failed" };
  } catch {
    return { ok: false, reason: "failed" };
  }
}

export const AI_FALLBACK_MESSAGE: Record<Exclude<AiCopyOutcome, { ok: true }>["reason"], string> = {
  offline: "Tidak ada sinyal, jadi teks disusun dari template. Coba AI lagi saat online.",
  unavailable: "Layanan AI belum aktif di server ini, jadi teks disusun dari template.",
  busy: "Batas permintaan AI tercapai, jadi teks disusun dari template. Coba lagi nanti.",
  rejected: "Jawaban AI tidak lolos pemeriksaan klaim dan harga, jadi teks disusun dari template.",
  failed: "AI belum bisa dihubungi, jadi teks disusun dari template.",
};
