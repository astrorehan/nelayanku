"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { RolePage } from "@/components/layout/role-shell";
import { ProducerTopBar } from "@/components/shells/role-shells";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, LedgerRow, Notice, Pill, SimulatedTag, SourceNote } from "@/components/ui/surface";
import { useDemoDatabase, useDemoHydrated } from "@/data/demo-data-provider";
import { DEMO_PRODUCER_ID } from "@/data/demo-identities";
import {
  costBreakdown,
  findProducerProduct,
  productOrigin,
  type CostSegment,
} from "@/data/queries/studio-pages";
import type { ProductCaptions } from "@/data/types";
import { findForbiddenClaims } from "@/domain/label-compliance";
import {
  formatKg,
  formatNumber,
  formatPercent,
  formatRupiah,
  formatShortDate,
} from "@/lib/format";
import { printDocument } from "@/lib/print-document";
import { CLAIM_LABEL, REQUIREMENT_LABEL } from "./label-step";
import { ProductLabel, productLabelDocument } from "./product-label";
import { LabelStatusChip, LoadingPanel } from "./studio-parts";

const CAPTION_CHANNELS: Array<{ key: keyof ProductCaptions; label: string }> = [
  { key: "whatsappStatus", label: "Status WhatsApp" },
  { key: "marketplace", label: "Deskripsi toko online" },
  { key: "instagram", label: "Caption Instagram" },
];

const SEGMENT_COLOR: Record<CostSegment["key"], string> = {
  fish: "bg-ink",
  seasoning: "bg-sea",
  fuel: "bg-sky",
  labor: "bg-line-strong",
  packaging: "bg-ink-3",
};

function NotFoundState() {
  return (
    <>
      <ProducerTopBar back={{ href: "/umkm/produk", label: "Kembali ke daftar produk" }} title="Produk tidak ditemukan" />
      <RolePage>
        <Notice tone="warning" title="Produk ini tidak ada di perangkat ini">
          Tautannya mungkin salah, atau produk belum pernah disimpan di sini.
        </Notice>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/umkm/produk" variant="quiet" icon="jar">
            Lihat semua produk
          </ButtonLink>
          <ButtonLink href="/umkm/studio" icon="plus">
            Produk baru
          </ButtonLink>
        </div>
      </RolePage>
    </>
  );
}

export function ProductDetail({ id }: { id: string }) {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const [feedback, setFeedback] = useState("");
  const summary = findProducerProduct(db, DEMO_PRODUCER_ID, id);

  if (!hydrated && !summary) {
    return (
      <>
        <ProducerTopBar back={{ href: "/umkm/produk", label: "Kembali ke daftar produk" }} title="Produk" />
        <RolePage>
          <LoadingPanel />
        </RolePage>
      </>
    );
  }
  if (!summary) {
    return <NotFoundState />;
  }

  const { product, cost, price, marginPerPack, compliance, missingCount } = summary;
  const segments = costBreakdown(product);
  const origin = productOrigin(db, product);
  const satisfied = compliance.checks.filter((check) => check.satisfied).length;
  const editHref = `/umkm/studio?produk=${encodeURIComponent(product.id)}`;

  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setFeedback(`${label} disalin`);
    } catch {
      setFeedback("Belum bisa menyalin. Pilih teks, lalu salin manual.");
    }
  };

  return (
    <>
      <ProducerTopBar
        back={{ href: "/umkm/produk", label: "Kembali ke daftar produk" }}
        title={product.name || "Produk tanpa nama"}
        subtitle={product.brand || undefined}
        action={
          <ButtonLink href={editHref} variant="quiet" size="md" icon="edit" className="hidden sm:inline-flex">
            Ubah di studio
          </ButtonLink>
        }
      />
      <RolePage>
        <div className="flex flex-wrap items-center gap-3">
          <LabelStatusChip summary={summary} />
          <SimulatedTag />
          <ButtonLink href={editHref} variant="quiet" size="md" icon="edit" className="sm:hidden">
            Ubah di studio
          </ButtonLink>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
            <h2 className="type-h3">Label</h2>
            <ProductLabel product={product} />
            <Button
              variant="quiet"
              icon="printer"
              disabled={!summary.ready || !product.materialId}
              onClick={async () => {
                try {
                  await printDocument(
                    `Label ${product.name}`,
                    productLabelDocument(product, window.location.origin),
                  );
                } catch {
                  setFeedback("Label belum bisa dibuka. Coba lagi.");
                }
              }}
            >
              Cetak label / simpan PDF
            </Button>
            {(!summary.ready || !product.materialId) && (
              <p className="text-sm text-ink-2">
                {!product.materialId
                  ? "Pilih asal bahan di studio sebelum cetak."
                  : "Lengkapi isian label di studio sebelum cetak."}
              </p>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-8">
            <section aria-labelledby="modal-heading" className="flex flex-col gap-4">
              <h2 id="modal-heading" className="type-h2">
                Modal dan harga
              </h2>
              {cost && price !== null && marginPerPack !== null ? (
                <Card className="flex flex-col gap-5 p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-ink-2">Modal per kemasan (HPP)</span>
                      <span className="type-money text-[1.5rem]">{formatRupiah(cost.costPerPack)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-ink-2">Harga jual saran</span>
                      <span className="type-money text-[1.5rem]">{formatRupiah(price)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div
                      role="img"
                      aria-label={`Susunan modal: ${segments
                        .map((segment) => `${segment.label} ${formatPercent(segment.share)}`)
                        .join(", ")}`}
                      className="flex h-4 w-full overflow-hidden rounded-full bg-paper-deep"
                    >
                      {segments
                        .filter((segment) => segment.amount > 0)
                        .map((segment) => (
                          <span
                            key={segment.key}
                            className={clsx("h-full border-r border-surface last:border-r-0", SEGMENT_COLOR[segment.key])}
                            style={{ width: `${segment.share * 100}%` }}
                          />
                        ))}
                    </div>
                    <ul className="flex flex-col gap-2">
                      {segments.map((segment) => (
                        <li key={segment.key} className="flex items-center gap-3">
                          <span aria-hidden className={clsx("size-3 shrink-0 rounded-full", SEGMENT_COLOR[segment.key])} />
                          <LedgerRow
                            className="flex-1"
                            label={`${segment.label} · ${formatPercent(segment.share)}`}
                            value={formatRupiah(segment.amount)}
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-2 border-t border-line pt-4">
                    <LedgerRow strong label="Total modal" value={formatRupiah(cost.totalCost)} />
                    <LedgerRow
                      label="Hasil olahan"
                      value={`${formatNumber(cost.packCount)} kemasan · ${formatNumber(product.run.packNetWeightGrams)} g`}
                    />
                    <LedgerRow label="Susut pengolahan" value={`bahan jadi ${formatPercent(product.run.yieldRatio)}`} />
                    <LedgerRow
                      strong
                      label={`Margin per kemasan (tambahan ${formatPercent(product.marginRate)})`}
                      value={formatRupiah(marginPerPack)}
                    />
                  </div>
                  <SourceNote simulated>
                    Dihitung dari isian di studio. Harga jual dibulatkan ke atas Rp500, dan Anda bebas menentukan sendiri.
                  </SourceNote>
                </Card>
              ) : (
                <Notice tone="warning" title="Modal belum bisa dihitung">
                  Periksa berat bahan, hasil olahan, dan biaya di studio.
                </Notice>
              )}
            </section>

            <section aria-labelledby="label-heading" className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 id="label-heading" className="type-h2">
                  Kelengkapan label
                </h2>
                <p className="tabular text-ink-2">
                  {satisfied} dari {compliance.checks.length} isian lengkap
                  {compliance.forbiddenClaims.length > 0 && `, ${compliance.forbiddenClaims.length} klaim perlu dihapus`}
                </p>
              </div>
              <ul className="flex flex-wrap gap-2">
                {compliance.checks.map((check) => (
                  <li key={check.requirement}>
                    <Pill tone={check.satisfied ? "success" : "warning"} icon={check.satisfied ? "check" : "warning"}>
                      {REQUIREMENT_LABEL[check.requirement]}
                      {check.formatProblem ? " (periksa format)" : ""}
                    </Pill>
                  </li>
                ))}
                {compliance.forbiddenClaims.map((claim) => (
                  <li key={claim}>
                    <Pill tone="danger" icon="warning">
                      {CLAIM_LABEL[claim]}
                    </Pill>
                  </li>
                ))}
              </ul>
              {missingCount > 0 && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Link
                    href={`${editHref}&langkah=4`}
                    className="inline-flex min-h-12 items-center font-semibold text-sea-deep underline underline-offset-4"
                  >
                    Lengkapi di studio
                  </Link>
                  <Link
                    href="/umkm/izin"
                    className="inline-flex min-h-12 items-center font-semibold text-sea-deep underline underline-offset-4"
                  >
                    Lihat jalur izin
                  </Link>
                </div>
              )}
              <SourceNote>
                Mengacu PerBPOM 31/2018. Pemeriksaan ini membantu kelengkapan, bukan penerbitan izin atau pengganti
                pemeriksaan pihak berwenang.
              </SourceNote>
            </section>

            <section aria-labelledby="teks-heading" className="flex flex-col gap-4">
              <h2 id="teks-heading" className="type-h2">
                Teks jualan
              </h2>
              {CAPTION_CHANNELS.map(({ key, label }) => {
                const text = product.captions[key];
                const claims = findForbiddenClaims({
                  marketingText: text,
                  halalCertificateNumber: product.label.halalCertificateNumber,
                });
                return (
                  <Card key={key} className="flex flex-col gap-3 p-4">
                    <h3 className="font-semibold">{label}</h3>
                    {text.trim() ? (
                      <p className="whitespace-pre-line text-ink-2">{text}</p>
                    ) : (
                      <p className="text-ink-2">Belum disusun. Buka studio, langkah teks jualan.</p>
                    )}
                    {claims.length > 0 && (
                      <Notice tone="danger" title="Hapus klaim yang belum didukung sebelum membagikan" />
                    )}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="quiet"
                        size="md"
                        icon="copy"
                        disabled={!text.trim() || claims.length > 0}
                        onClick={() => void copy(label, text)}
                      >
                        Salin teks
                      </Button>
                      {key === "whatsappStatus" && (
                        <Button
                          variant="ghost"
                          size="md"
                          icon="chat"
                          disabled={!text.trim() || claims.length > 0}
                          onClick={() =>
                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer")
                          }
                        >
                          Buka WhatsApp
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
              {feedback && <p role="status">{feedback}</p>}
            </section>

            <section aria-labelledby="asal-heading" className="flex flex-col gap-4">
              <h2 id="asal-heading" className="type-h2">
                Asal bahan
              </h2>
              {origin ? (
                <Card className="flex flex-col gap-3 p-5">
                  <p className="font-semibold">
                    {origin.view.species.name} · {formatKg(product.run.rawFishKg)} diolah
                  </p>
                  <p className="text-ink-2">
                    Darat {formatShortDate(origin.view.landing.landedAt)} di {db.kub.port}, {db.kub.name}. Nelayan{" "}
                    {origin.view.fisher.name}.
                  </p>
                  <ButtonLink
                    href={`/lacak/bahan/${encodeURIComponent(origin.material.id)}`}
                    variant="quiet"
                    size="md"
                    icon="qr"
                    className="self-start"
                  >
                    Lihat asal bahan
                  </ButtonLink>
                </Card>
              ) : (
                <Notice tone="neutral" title="Asal bahan belum dipilih">
                  Produk ini belum terhubung ke ikan dari dermaga, jadi label belum punya QR asal bahan.
                </Notice>
              )}
            </section>
          </div>
        </div>
      </RolePage>
    </>
  );
}
