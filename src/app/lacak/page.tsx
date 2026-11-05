import type { Metadata } from "next";
import { PublicHeader } from "@/components/layout/public-header";
import { TraceEntry } from "@/components/tracking/trace-entry";

export const metadata: Metadata = { title: "Lacak kiriman" };
export default function TrackingPage() {
  return <><PublicHeader ctaMode="never" /><main className="mx-auto flex max-w-xl flex-col gap-6 px-4 py-10 sm:px-6"><div><p className="type-eyebrow mb-3">Dari dermaga ke dapur</p><h1 className="type-title">Lacak kiriman</h1><p className="mt-4 text-ink-2">Lihat asal ikan, hasil penilaian, dan catatan es dari kode pada label</p></div><TraceEntry /></main></>;
}
