import type { Metadata } from "next";
import Link from "next/link";
import { freshnessModel } from "@/ai/model-instance";
import { SAMPLE_PHOTOS } from "@/ai/sample-photos";
import { ButtonLink } from "@/components/ui/button";
import { Card, Notice, SimulatedTag } from "@/components/ui/surface";

export const metadata: Metadata = {
  title: "Cara model menilai dan batasannya",
};

const dataset = SAMPLE_PHOTOS[0].source;
const rows = [
  [
    "Mata",
    "Probabilitas sangat segar × 9 + segar × 7 + tidak segar × 5",
    "25%",
  ],
  ["Insang", "Probabilitas segar × 9 + tidak segar × 5", "25%"],
  ["Bau", "Pilihan manusia: segar 9, netral 7, agak asam 5, busuk 1", "25%"],
  [
    "Tekstur",
    "Pilihan manusia: padat 9, agak lunak 7, lunak 5, sangat lunak 3",
    "25%",
  ],
];

export default function ModelPage() {
  return (
    <>
      <main
        id="main-content"
        className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16"
      >
        <header className="flex flex-col gap-4">
          <p className="type-eyebrow">Penilaian yang bisa diperiksa</p>
          <h1 className="type-title">Apa yang dinilai, apa yang belum</h1>
          <p className="type-lead max-w-2xl text-ink-2">
            Skor membantu operator membaca mutu ikan. Keputusan tetap pada
            manusia, dengan catatan asal, es, dan waktu pendaratan.
          </p>
        </header>
        <Notice tone="warning" title="Model terlatih belum dipasang">
          Demo memakai hasil simulasi untuk enam foto contoh. Foto yang Anda
          unggah tidak mendapat prediksi AI; mata dan insangnya dinilai manual.
          Skor bukan sertifikat SNI atau uji keamanan pangan.
        </Notice>
        <Card className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8">
          <div>
            <p className="mb-2 text-ink-2">Versi aktif</p>
            <p className="type-code break-words">{freshnessModel.version}</p>
            <p className="mt-3">
              <SimulatedTag />
            </p>
          </div>
          <div>
            <p className="mb-2 text-ink-2">Bukti pengujian</p>
            <p>
              Akurasi per spesies, confusion matrix, dan waktu inferensi belum
              diukur
            </p>
            <p className="mt-2 text-sm text-ink-2">
              Angka target dalam PRD bukan hasil evaluasi model
            </p>
          </div>
        </Card>
        <section className="flex flex-col gap-4">
          <h2 className="type-h2">Empat dari enam parameter</h2>
          <p className="text-ink-2">
            Rumus bergaya SNI 2729 menggabungkan mata, insang, bau, dan tekstur.
            Lendir permukaan dan daging belum dinilai. Bobot dan batas mutu
            adalah aturan proyek yang masih perlu validasi ahli perikanan.
          </p>
          <div className="overflow-x-auto rounded-[12px] border border-line">
            <table className="w-full text-left">
              <caption className="sr-only">
                Rumus dan bobot tiap parameter
              </caption>
              <thead className="bg-paper-deep">
                <tr>
                  {["Parameter", "Skor 1–9", "Bobot"].map((label) => (
                    <th key={label} scope="col" className="p-4 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map(([part, formula, weight]) => (
                  <tr key={part} className="border-t border-line bg-surface">
                    <th scope="row" className="p-4 font-medium">
                      {part}
                    </th>
                    <td className="p-4">{formula}</td>
                    <td className="tabular p-4">{weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Skor akhir = (mata + insang + bau + tekstur) / 4, dibulatkan satu
            desimal
          </p>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="type-h2">Dari skor ke tujuan ikan</h2>
          <dl className="divide-y divide-line border-y border-line">
            {[
              [
                "A · Prima",
                "Skor ≥8,0, tanpa parameter di bawah 7. Untuk pesanan institusi.",
              ],
              [
                "B · Segar",
                "Skor ≥7,0. Untuk pesanan yang sesuai mutu atau TPI.",
              ],
              [
                "C · Olahan",
                "Skor ≥5,0 dan <7,0. Perlu diperiksa ulang pengolah sebelum dipakai.",
              ],
              [
                "Tolak",
                "Skor <5,0 atau bau busuk. Tidak untuk konsumsi, termasuk olahan.",
              ],
            ].map(([label, text]) => (
              <div
                key={label}
                className="grid gap-2 py-4 sm:grid-cols-[9rem_1fr]"
              >
                <dt className="font-medium">{label}</dt>
                <dd className="text-ink-2">{text}</dd>
              </div>
            ))}
          </dl>
          <p className="text-ink-2">
            Operator dapat mengubah mutu dengan alasan yang dicatat. Bau busuk
            tetap memveto penjualan. Untuk tongkol, cakalang, dan tuna, status
            es dan batas waktu juga menentukan kelayakan ke dapur SPPG.
          </p>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="type-h2">Kapan skor tidak cukup</h2>
          <ul className="list-disc space-y-3 pl-5 text-ink-2">
            <li>
              Skor organoleptik tidak mengukur histamin, bakteri, atau bahan
              kimia. Rantai dingin dan pemeriksaan penerimaan tetap diperlukan.
            </li>
            <li>
              Foto gelap, buram, atau silau perlu diulang. Foto yang lolos
              pemeriksaan gambar belum tentu foto ikan yang layak dinilai.
            </li>
            <li>
              Enam foto contoh adalah mata ikan kembung, bukan bukti akurasi
              untuk tongkol atau cakalang. Tidak ada foto insang pada contoh
              tersebut.
            </li>
            <li>
              Hasil simulasi mengikuti kelas contoh yang sudah diketahui, bukan
              model yang membaca piksel. Jangan dipakai untuk memutuskan
              keamanan ikan nyata.
            </li>
          </ul>
        </section>
        <section className="flex flex-col gap-4">
          <h2 className="type-h2">Dataset dan asal foto</h2>
          <Card className="flex flex-col gap-3 p-6">
            <h3 className="type-h3">{dataset.dataset}</h3>
            <p>{dataset.authors}</p>
            <p className="text-ink-2">
              {dataset.changes} Foto dipakai untuk contoh penilaian. Data latih
              dan data uji model produksi belum ditetapkan.
            </p>
            <a
              href={`https://doi.org/${dataset.doi}`}
              target="_blank"
              rel="noreferrer"
              className="min-h-12 py-3 underline underline-offset-4"
            >
              Dataset asli · DOI {dataset.doi}
            </a>
            <a
              href={dataset.licenseUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Lisensi {dataset.license}
            </a>
          </Card>
          <p className="text-ink-2">
            Rencana berikutnya: latih model mata/insang, pisahkan data uji,
            laporkan hasil per spesies dan kesalahan klasifikasi, lalu ukur
            inferensi pada HP sebelum mengganti simulasi.
          </p>
        </section>
        <div className="flex flex-wrap items-center gap-4">
          <ButtonLink href="/coba" icon="eye">
            Coba foto contoh
          </ButtonLink>
          <Link
            href="/lacak"
            className="min-h-12 py-3 underline underline-offset-4"
          >
            Periksa bukti mutu kiriman
          </Link>
        </div>
      </main>
    </>
  );
}
