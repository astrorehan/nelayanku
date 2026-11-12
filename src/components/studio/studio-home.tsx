"use client";

import { RolePage } from "@/components/layout/role-shell";
import { ProducerTopBar } from "@/components/shells/role-shells";
import { ButtonLink } from "@/components/ui/button";
import { Card, SimulatedTag } from "@/components/ui/surface";
import { useDemoDatabase, useDemoHydrated, useDemoNow } from "@/data/demo-data-provider";
import { DEMO_PRODUCER_ID } from "@/data/demo-identities";
import { availableMaterialCards, producerProducts, studioStats } from "@/data/queries/studio-pages";
import { formatDayDate, formatKg } from "@/lib/format";
import { LoadingPanel, MaterialCard, ProductCard } from "./studio-parts";

const TEASER_COUNT = 2;

export function StudioHome() {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const now = useDemoNow();
  const summaries = producerProducts(db, DEMO_PRODUCER_ID);
  const stats = studioStats(summaries);
  const materials = availableMaterialCards(db, DEMO_PRODUCER_ID, now);
  const producer = db.producers.find((item) => item.id === DEMO_PRODUCER_ID);

  const statItems = [
    { label: "produk tersimpan", value: String(stats.productCount) },
    { label: "bahan terselamatkan", value: formatKg(stats.rescuedKg) },
    { label: "siap cetak", value: String(stats.readyCount) },
    { label: "belum siap cetak", value: String(stats.notReadyCount) },
  ];

  return (
    <>
      <ProducerTopBar contextOnly title={producer?.name ?? "Studio olahan"} subtitle={db.kub.port} />
      <RolePage className="lg:gap-8">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="flex flex-col gap-3">
            <p className="flex items-center gap-3 text-ink-2">
              {formatDayDate(now)}
              <SimulatedTag />
            </p>
            <h2 className="type-title">Studio olahan</h2>
            <p className="max-w-xl text-ink-2">
              Ikan mutu C dari dermaga diolah jadi produk, lengkap dengan modal, label, dan teks jualan.
            </p>
          </div>
          <ButtonLink href="/umkm/studio" size="lg" icon="plus">
            Produk baru
          </ButtonLink>
        </header>

        <dl className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {statItems.map((stat) => (
            <div key={stat.label} className="flex flex-col-reverse gap-1 rounded-[20px] bg-surface px-4 py-3.5 sm:px-5">
              <dt className="text-sm text-ink-2">{stat.label}</dt>
              <dd className="type-money text-[1.5rem] sm:text-[1.875rem]">{hydrated ? stat.value : "–"}</dd>
            </div>
          ))}
        </dl>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <section aria-labelledby="produk-heading" className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="produk-heading" className="type-h2">
                Produk Anda
              </h2>
              <ButtonLink href="/umkm/produk" variant="ghost" size="md" iconAfter="arrowRight">
                Semua produk
              </ButtonLink>
            </div>
            {!hydrated ? (
              <LoadingPanel />
            ) : summaries.length ? (
              <div className="flex flex-col gap-3">
                {summaries.map((summary) => (
                  <ProductCard key={summary.product.id} summary={summary} />
                ))}
              </div>
            ) : (
              <Card className="flex flex-col items-start gap-3 p-5">
                <p>Belum ada produk. Mulai dari bahan mutu C yang tersedia, lalu hitung modal dan susun label.</p>
                <ButtonLink href="/umkm/studio" icon="plus">
                  Buat produk pertama
                </ButtonLink>
              </Card>
            )}
          </section>

          <section aria-labelledby="bahan-heading" className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 id="bahan-heading" className="type-h2">
                Bahan tersedia
              </h2>
              <ButtonLink href="/umkm/bahan" variant="ghost" size="md" iconAfter="arrowRight">
                Lihat semua
              </ButtonLink>
            </div>
            {!hydrated ? (
              <LoadingPanel />
            ) : materials.length ? (
              <div className="flex flex-col gap-3">
                {materials.slice(0, TEASER_COUNT).map((item) => (
                  <MaterialCard key={item.materialId} item={item} compact />
                ))}
                {materials.length > TEASER_COUNT && (
                  <p className="text-ink-2">
                    Ada {materials.length - TEASER_COUNT} bahan lain di halaman Bahan baku.
                  </p>
                )}
              </div>
            ) : (
              <Card className="p-5 text-ink-2">
                Belum ada ikan mutu C yang tersedia hari ini. Operator KUB mengarahkan ikan mutu C ke olahan saat
                pemilahan, jadi cek lagi nanti.
              </Card>
            )}
          </section>
        </div>
      </RolePage>
    </>
  );
}
