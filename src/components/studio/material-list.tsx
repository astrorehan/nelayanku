"use client";

import clsx from "clsx";
import { useState } from "react";
import { RolePage } from "@/components/layout/role-shell";
import { ProducerTopBar } from "@/components/shells/role-shells";
import { ButtonLink } from "@/components/ui/button";
import { Card, Notice } from "@/components/ui/surface";
import { useDemoDatabase, useDemoHydrated, useDemoNow } from "@/data/demo-data-provider";
import { DEMO_PRODUCER_ID } from "@/data/demo-identities";
import { availableMaterialCards } from "@/data/queries/studio-pages";
import { formatKg } from "@/lib/format";
import { LoadingPanel, MaterialCard } from "./studio-parts";

export function MaterialList() {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const now = useDemoNow();
  const [species, setSpecies] = useState<string | null>(null);
  const all = availableMaterialCards(db, DEMO_PRODUCER_ID, now);
  const speciesOptions = [...new Map(all.map((item) => [item.speciesId, item.speciesName])).entries()];
  const shown = species ? all.filter((item) => item.speciesId === species) : all;
  const totalKg = shown.reduce((sum, item) => sum + item.kg, 0);

  return (
    <>
      <ProducerTopBar title="Bahan baku" subtitle="Ikan mutu C dari dermaga" />
      <RolePage>
        <p className="max-w-2xl text-ink-2">
          Hanya ikan mutu C yang belum dipakai produk lain. Ikan tolak tidak masuk daftar ini. Bahan baru diambil
          saat Anda memilihnya di studio.
        </p>

        {hydrated && speciesOptions.length > 1 && (
          <div role="group" aria-label="Saring menurut jenis ikan" className="flex flex-wrap gap-2">
            {[[null, "Semua"] as const, ...speciesOptions].map(([id, name]) => (
              <button
                key={id ?? "semua"}
                type="button"
                aria-pressed={species === id}
                onClick={() => setSpecies(id)}
                className={clsx(
                  "min-h-12 rounded-full border px-5 font-semibold transition-colors",
                  species === id
                    ? "border-sky bg-sky-tint text-sea-deep"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
                )}
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {!hydrated ? (
          <LoadingPanel />
        ) : shown.length ? (
          <>
            <p className="tabular font-semibold" role="status">
              {shown.length} lot · {formatKg(totalKg)} tersedia
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {shown.map((item) => (
                <MaterialCard key={item.materialId} item={item} />
              ))}
            </div>
          </>
        ) : (
          <Card className="flex flex-col items-start gap-3 p-5">
            <p>
              {all.length
                ? "Tidak ada bahan untuk jenis ikan ini. Pilih Semua untuk melihat bahan lain."
                : "Belum ada ikan mutu C yang tersedia hari ini. Operator KUB mengarahkan ikan mutu C ke olahan saat pemilahan, jadi cek lagi nanti."}
            </p>
            <ButtonLink href="/umkm" variant="quiet" icon="home">
              Kembali ke beranda studio
            </ButtonLink>
          </Card>
        )}

        <Notice tone="warning" title="Periksa kembali sebelum diolah">
          Skor mutu bukan uji keamanan. Bau busuk dan ikan yang tidak layak tidak boleh diolah. Jam sejak darat
          ditampilkan supaya bahan lama tidak terlewat.
        </Notice>
      </RolePage>
    </>
  );
}
