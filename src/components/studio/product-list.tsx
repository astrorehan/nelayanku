"use client";

import { RolePage } from "@/components/layout/role-shell";
import { ProducerTopBar } from "@/components/shells/role-shells";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { useDemoDatabase, useDemoHydrated } from "@/data/demo-data-provider";
import { DEMO_PRODUCER_ID } from "@/data/demo-identities";
import { producerProducts } from "@/data/queries/studio-pages";
import { LoadingPanel, ProductCard } from "./studio-parts";

export function ProductList() {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const summaries = producerProducts(db, DEMO_PRODUCER_ID);
  return (
    <>
      <ProducerTopBar
        title="Produk"
        subtitle={hydrated ? `${summaries.length} produk tersimpan` : undefined}
        action={
          <span className="hidden sm:block">
            <ButtonLink href="/umkm/studio" size="md" icon="plus">Produk baru</ButtonLink>
          </span>
        }
      />
      <RolePage>
        {!hydrated ? (
          <LoadingPanel />
        ) : summaries.length ? (
          <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
            {summaries.map((summary) => (
              <ProductCard key={summary.product.id} summary={summary} />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-start gap-3 p-5">
            <p>Belum ada produk tersimpan. Mulai dari bahan mutu C, lalu hitung modal dan susun label.</p>
          </Card>
        )}
        <ButtonLink href="/umkm/studio" size="lg" icon="plus" className="sm:hidden" block>
          Produk baru
        </ButtonLink>
      </RolePage>
    </>
  );
}
