"use client";

import { ParameterBars } from "@/components/grading/score-summary";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, Notice, SimulatedTag } from "@/components/ui/surface";
import { ButtonLink } from "@/components/ui/button";
import { useDemoDatabase, useDemoHydrated } from "@/data/demo-data-provider";
import { publicMaterialTrace } from "@/data/queries/tracking";
import {
  formatClock,
  formatFullDate,
  formatKg,
  formatScore,
} from "@/lib/format";

export function MaterialTrace({ id }: { id: string }) {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const trace = publicMaterialTrace(db, id);
  if (!hydrated) return <p aria-busy="true">Membuka catatan bahan…</p>;
  if (!trace)
    return (
      <div className="flex flex-col gap-4">
        <h1 className="type-title">Asal bahan belum ditemukan</h1>
        <Notice tone="warning" title="Asal bahan tidak ditemukan">
          Bahan yang dicatat di demo hanya tersedia di browser tempat
          pencatatannya dilakukan
        </Notice>
        <ButtonLink href="/lacak" variant="quiet" icon="arrowLeft" className="self-start">
          Lacak kiriman lain
        </ButtonLink>
      </div>
    );
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4">
        <p className="flex items-center gap-3 text-ink-2">
          Asal bahan olahan <SimulatedTag />
        </p>
        <h1 className="type-title">Dari dermaga ke produk</h1>
      </header>
      <div className="grid items-start gap-4 md:grid-cols-2">
        <Card className="flex flex-col gap-5 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <GradeStamp grade={trace.grade} size="lg" />
            <div className="min-w-0">
              <h2 className="type-h2">
                {trace.species} · {formatKg(trace.kg)}
              </h2>
              <p className="mt-2 text-ink-2">
                Skor {formatScore(trace.score)} / 9 · sebelum diolah
              </p>
            </div>
          </div>
          <dl className="grid gap-4 border-t border-line pt-5">
            <div>
              <dt className="text-ink-2">KUB dan wilayah</dt>
              <dd>
                {trace.kub} · {trace.port}, {trace.regency}
              </dd>
            </div>
            <div>
              <dt className="text-ink-2">Pendaratan</dt>
              <dd>
                {trace.fisherLabel} · {formatFullDate(trace.landedAt)},{" "}
                {formatClock(trace.landedAt)} WIB
              </dd>
            </div>
            <div>
              <dt className="text-ink-2">Penyimpanan saat darat</dt>
              <dd>{trace.iced ? "Pakai es" : "Tanpa es"}</dd>
            </div>
          </dl>
        </Card>
        <Card className="flex flex-col gap-5 p-5 sm:p-6">
          <h2 className="type-h3">Nilai per parameter</h2>
          <ParameterBars parameters={trace.parameters} />
          <div className="flex flex-col gap-1 border-t border-line pt-5">
            <p className="text-sm text-ink-2">Cap data SHA-256</p>
            <code className="break-all text-sm">{trace.auditHash}</code>
          </div>
        </Card>
      </div>
      <Notice tone="neutral" title="Catatan bahan, bukan hasil uji produk">
        Penilaian ikan sebelum diolah tidak membuktikan keamanan atau umur
        simpan produk jadi. Periksa label dan proses pengolahannya.
      </Notice>
      <ButtonLink href="/lacak" variant="quiet" icon="arrowLeft" className="self-start">
        Lacak kiriman lain
      </ButtonLink>
    </div>
  );
}
