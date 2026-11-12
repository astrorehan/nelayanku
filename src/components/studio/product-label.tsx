import { pirtLabel } from "@/domain/label-compliance";
import { qrGeometry, qrMarkup } from "@/lib/qr";
import { escapeHtml } from "@/lib/print-document";
import type { Product } from "@/data/types";
import { formatFullDate, formatNumber } from "@/lib/format";

const labelDate = (value: string) =>
  value ? formatFullDate(`${value}T12:00:00+07:00`) : "Belum diisi";

export function productLabelDocument(product: Product, origin: string) {
  const label = product.label;
  return `<section class="label"><p>${escapeHtml(product.brand)}</p><h1>${escapeHtml(label.productName)}</h1><p>Berat bersih ${escapeHtml(label.netWeightGrams ?? 0)} g</p><p>Komposisi: ${escapeHtml(label.ingredients.join(", "))}</p><p>Diproduksi oleh ${escapeHtml(label.producerName)}<br>${escapeHtml(label.producerAddress)}</p><p>Kode produksi ${escapeHtml(label.productionCode)}<br>Produksi ${escapeHtml(labelDate(label.productionDate))}<br>Baik digunakan sebelum ${escapeHtml(labelDate(label.bestBefore))}</p><p>${escapeHtml(pirtLabel(label.pirtNumber))}</p>${label.halalCertificateNumber ? `<p>No. sertifikat halal: ${escapeHtml(label.halalCertificateNumber)}</p>` : ""}<p>${escapeHtml(label.marketingText)}</p>${product.materialId ? `${qrMarkup(`${origin}/lacak/bahan/${encodeURIComponent(product.materialId)}`)}<p>Asal bahan · pindai QR</p>` : ""}<p><small>Label simulasi · nomor izin contoh bukan izin usaha nyata</small></p></section>`;
}

export function ProductLabel({ product }: { product: Product }) {
  const label = product.label;
  const qr = product.materialId
    ? qrGeometry(`/lacak/bahan/${encodeURIComponent(product.materialId)}`)
    : null;
  return (
    <div className="flex flex-col gap-4 border border-ink bg-white p-6 text-ink">
      <div>
        <p className="text-sm text-ink-2">{product.brand || "Merek Anda"}</p>
        <h2 className="mt-2 font-hull text-3xl font-bold tracking-[-0.025em]">
          {label.productName || "Nama produk"}
        </h2>
        <p className="tabular mt-2">
          Berat bersih {formatNumber(label.netWeightGrams ?? 0)} g
        </p>
      </div>
      <p>
        Komposisi:{" "}
        {label.ingredients.filter(Boolean).join(", ") || "Belum diisi"}
      </p>
      <p>
        {label.producerName}
        <br />
        {label.producerAddress}
      </p>
      <dl className="flex flex-col gap-2 text-sm">
        <div>
          <dt>Kode produksi</dt>
          <dd>{label.productionCode || "Belum diisi"}</dd>
        </div>
        <div>
          <dt>Tanggal produksi</dt>
          <dd>{labelDate(label.productionDate)}</dd>
        </div>
        <div>
          <dt>Baik digunakan sebelum</dt>
          <dd>{labelDate(label.bestBefore)}</dd>
        </div>
      </dl>
      <p className="break-words">
        {label.pirtNumber ? pirtLabel(label.pirtNumber) : "P-IRT belum diisi"}
      </p>
      {label.halalCertificateNumber && (
        <p>No. sertifikat halal: {label.halalCertificateNumber}</p>
      )}
      {label.marketingText && <p>{label.marketingText}</p>}
      {qr && (
        <div className="border-t border-line pt-4">
          <svg
            viewBox={`0 0 ${qr.size} ${qr.size}`}
            width={80}
            height={80}
            aria-label="Pratinjau QR asal bahan"
            role="img"
          >
            <rect width={qr.size} height={qr.size} fill="white" />
            <path d={qr.path} fill="black" />
          </svg>
          <p className="mt-2 text-sm text-ink-2">
            QR lengkap dibuat saat cetak
          </p>
        </div>
      )}
      <p className="text-sm text-ink-2">Pratinjau simulasi · bukan izin edar</p>
    </div>
  );
}
