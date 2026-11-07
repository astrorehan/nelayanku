import type { Metadata } from "next";
import { TraceEntry } from "@/components/tracking/trace-entry";
import { TraceExamples } from "@/components/tracking/trace-examples";

export const metadata: Metadata = { title: "Lacak kiriman" };
export default function TrackingPage() {
  return (
    <main
      id="main-content"
      className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:py-14"
    >
      <div className="max-w-2xl">
        <p className="type-eyebrow mb-3">Dari dermaga ke dapur</p>
        <h1 className="type-title">Lacak kiriman</h1>
        <p className="mt-4 text-ink-2">
          Lihat asal ikan, hasil penilaian, dan catatan es dari kode pada label
        </p>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <TraceEntry />
        <TraceExamples />
      </div>
    </main>
  );
}
