import { TextArea, TextField } from "@/components/ui/fields";
import { Notice } from "@/components/ui/surface";
import type { Product } from "@/data/types";
import {
  checkLabelCompliance,
  type LabelRequirement,
} from "@/domain/label-compliance";

const REQUIREMENT_LABEL: Record<LabelRequirement, string> = {
  product_name: "Nama produk",
  ingredients: "Komposisi",
  net_weight: "Berat bersih",
  producer: "Nama dan alamat pengolah",
  production_code_and_date: "Kode dan tanggal produksi",
  best_before: "Baik digunakan sebelum",
  pirt_number: "Nomor P-IRT, 15 digit",
};

const CLAIM_LABEL = {
  cure_claim: "Hapus klaim mengobati atau menyembuhkan",
  health_claim: "Hapus klaim kesehatan yang belum terbukti",
  halal_without_certificate:
    "Hapus klaim halal atau isi nomor sertifikat yang Anda miliki",
  bpom_registration_claim: "Hapus klaim izin BPOM dari teks jualan",
};

export function LabelStep({
  product,
  onChange,
}: {
  product: Product;
  onChange: (product: Product) => void;
}) {
  const label = product.label;
  const compliance = checkLabelCompliance(label);
  const update = (key: keyof typeof label, value: string) =>
    onChange({ ...product, label: { ...label, [key]: value } });
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="type-h2">Lengkapi label</h2>
        <p className="mt-2 text-ink-2">
          Nomor izin dan tanggal baik digunakan sebelum hanya Anda yang mengisi.
          Pemeriksaan ini membantu kelengkapan, bukan penerbitan izin.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          label="Nama pengolah"
          value={label.producerName}
          onChange={(event) => update("producerName", event.target.value)}
        />
        <TextField
          label="Kode produksi"
          value={label.productionCode}
          onChange={(event) => update("productionCode", event.target.value)}
          placeholder="Contoh: SJ-0511"
        />
        <TextField
          label="Tanggal produksi"
          type="date"
          value={label.productionDate}
          onChange={(event) => update("productionDate", event.target.value)}
        />
        <TextField
          label="Baik digunakan sebelum"
          type="date"
          value={label.bestBefore}
          min={label.productionDate}
          hint="Tetapkan dari uji daya simpan produk, bukan perkiraan otomatis"
          onChange={(event) => update("bestBefore", event.target.value)}
        />
      </div>
      <TextArea
        label="Alamat pengolah"
        value={label.producerAddress}
        onChange={(event) => update("producerAddress", event.target.value)}
      />
      <TextField
        label="Nomor P-IRT"
        value={label.pirtNumber}
        onChange={(event) => update("pirtNumber", event.target.value)}
        hint="Isi nomor izin milik usaha Anda. Demo tidak menerbitkan atau memverifikasi izin."
      />
      <TextField
        label="Nomor sertifikat halal · opsional"
        value={label.halalCertificateNumber}
        onChange={(event) =>
          update("halalCertificateNumber", event.target.value)
        }
        hint="Jangan menulis klaim halal jika belum memiliki sertifikat"
      />
      <TextArea
        label="Keterangan pada label · opsional"
        value={label.marketingText}
        onChange={(event) => update("marketingText", event.target.value)}
      />
      <div className="border-y border-line py-4">
        <h3 className="type-h3 mb-3">Periksa isi wajib</h3>
        <ul className="space-y-2">
          {compliance.checks.map((check) => (
            <li
              key={check.requirement}
              className={check.satisfied ? "text-ink-2" : "text-danger-ink"}
            >
              {check.satisfied ? "Lengkap" : "Belum lengkap"} ·{" "}
              {REQUIREMENT_LABEL[check.requirement]}
              {check.formatProblem ? " (periksa format)" : ""}
            </li>
          ))}
        </ul>
      </div>
      {compliance.forbiddenClaims.length > 0 && (
        <Notice tone="danger" title="Periksa klaim sebelum cetak">
          <ul className="list-disc space-y-2 pl-4">
            {compliance.forbiddenClaims.map((claim) => (
              <li key={claim}>{CLAIM_LABEL[claim]}</li>
            ))}
          </ul>
        </Notice>
      )}
      <details className="rounded-[12px] border border-line p-4">
        <summary className="min-h-12 cursor-pointer py-3 font-medium">
          Jalur izin usaha dan label
        </summary>
        <ol className="list-decimal space-y-3 pl-5">
          <li>
            <a
              href="https://oss.go.id/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              NIB melalui OSS
            </a>{" "}
            · identitas usaha
          </li>
          <li>
            <a
              href="https://sppirt.pom.go.id/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              SPP-IRT
            </a>{" "}
            · periksa kelayakan jenis pangan dan persyaratan bersama dinas
            setempat
          </li>
          <li>
            <a
              href="https://bpjph.halal.go.id/"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Sertifikasi halal melalui BPJPH
            </a>
          </li>
        </ol>
        <p className="mt-3 text-sm text-ink-2">
          Checklist mengacu PerBPOM 31/2018, bukan pengganti pemeriksaan label
          oleh pihak berwenang
        </p>
      </details>
    </div>
  );
}
