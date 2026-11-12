"use client";

import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { useDemoDatabase } from "@/data/demo-data-provider";
import { Card, Pill } from "@/components/ui/surface";
import type { MaterialCard as MaterialCardData, ProductSummary } from "@/data/queries/studio-pages";
import { formatClock, formatKg, formatNumber, formatRupiah, formatShortDate } from "@/lib/format";

export function LabelStatusChip({ summary }: { summary: ProductSummary }) {
  if (summary.compliance.forbiddenClaims.length > 0) {
    return <Pill tone="danger" icon="warning">Periksa klaim</Pill>;
  }
  return summary.ready ? (
    <Pill tone="success" icon="check">
      Siap cetak
    </Pill>
  ) : (
    <Pill tone="warning" icon="warning">
      Kurang {summary.missingCount} isian
    </Pill>
  );
}

export function ProductCard({ summary }: { summary: ProductSummary }) {
  const { product, cost, price } = summary;
  return (
    <Link
      href={`/umkm/produk/${encodeURIComponent(product.id)}`}
      className="group flex min-h-24 min-w-0 items-stretch gap-4 rounded-[20px] border border-line bg-surface p-4 transition-colors hover:border-line-strong"
    >
      <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-[14px] bg-sky-tint text-sea-deep sm:size-20">
        {product.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.photoDataUrl} alt="" className="size-full object-cover" />
        ) : (
          <Icon name="jar" size={32} />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="flex flex-col">
          <span className="break-words text-lg font-semibold leading-snug group-hover:underline group-hover:underline-offset-4">
            {product.name || "Produk tanpa nama"}
          </span>
          <span className="truncate text-ink-2">
            {product.brand || "Merek belum diisi"} · {formatNumber(product.run.packNetWeightGrams)} g
          </span>
        </span>
        <span className="grid grid-cols-2 gap-x-4 text-sm">
          <span className="flex flex-col">
            <span className="text-ink-2">Modal per kemasan</span>
            <span className="tabular font-semibold">{cost ? formatRupiah(cost.costPerPack) : "Belum dihitung"}</span>
          </span>
          <span className="flex flex-col">
            <span className="text-ink-2">Harga jual</span>
            <span className="tabular font-semibold">{price ? formatRupiah(price) : "Belum dihitung"}</span>
          </span>
        </span>
        <LabelStatusChip summary={summary} />
      </span>
      <Icon name="chevronRight" size={20} className="shrink-0 self-center text-ink-3" />
    </Link>
  );
}

export function MaterialCard({
  item,
  compact = false,
}: {
  item: MaterialCardData;
  compact?: boolean;
}) {
  const kubName = useDemoDatabase().kub.name;
  return (
    <Card className="flex flex-col gap-4 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <GradeStamp grade="C" size="sm" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="type-h3 truncate">{item.speciesName}</h3>
          <p className="tabular text-ink-2">
            {formatKg(item.kg)} · {formatRupiah(item.pricePerKg)}/kg
          </p>
        </div>
        {item.takenByMe && <Pill tone="info">Sudah Anda ambil</Pill>}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div className="flex flex-col">
          <dt className="text-ink-2">Sejak darat</dt>
          <dd className="tabular font-semibold">{item.hoursSinceLanding} jam</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-ink-2">Darat</dt>
          <dd className="tabular font-semibold">
            {formatShortDate(item.landedAt)}, {formatClock(item.landedAt)}
          </dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-ink-2">Penyimpanan</dt>
          <dd className="font-semibold">{item.iced ? "Pakai es" : "Tanpa es"}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-ink-2">Dari</dt>
          <dd className="font-semibold">{kubName}</dd>
        </div>
      </dl>
      <div className="flex flex-wrap gap-2">
        <ButtonLink href="/umkm/studio" size="md" icon="jar">
          Olah jadi produk
        </ButtonLink>
        {!compact && (
          <ButtonLink
            href={`/lacak/bahan/${encodeURIComponent(item.materialId)}`}
            variant="quiet"
            size="md"
            icon="qr"
          >
            Lihat asal
          </ButtonLink>
        )}
      </div>
    </Card>
  );
}

export function LoadingPanel({ label = "Membuka data studio di perangkat ini…" }: { label?: string }) {
  return (
    <p className="text-ink-2" aria-busy="true">
      {label}
    </p>
  );
}
