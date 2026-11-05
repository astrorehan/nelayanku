import { GradeStamp } from "@/components/ui/grade-stamp";
import { GRADE_MEANING } from "@/content/labels";
import { GRADES } from "@/domain/grade";
import { SimulatedTag } from "@/components/ui/surface";
import { priceBreakdown } from "@/domain/pricing";
import { formatRupiah } from "@/lib/format";
import { EXAMPLE_SPPG_BUYER_PRICE } from "@/content/market-facts";

const fisherPrice = priceBreakdown(
  EXAMPLE_SPPG_BUYER_PRICE,
  "sppg",
).fisherReceivesPerKg;
const STEPS = [
  {
    number: "01",
    context: "Sehari sebelumnya",
    title: "Pesanan sudah ada",
    body: "Dapur SPPG memesan 40 kg tongkol untuk besok pukul 08.00. KUB tahu jumlah dan mutu yang dibutuhkan sebelum kapal mendarat.",
    detail: "40 kg tongkol · mutu A",
  },
  {
    number: "02",
    context: "Saat kapal mendarat",
    title: "Mutu ikut tercatat",
    body: "Ikan ditimbang, mata dan insang diperiksa, lalu bau dan tekstur dinilai. Empat parameter menjadi satu catatan mutu, bergaya SNI 2729.",
    detail: "Foto → nilai → tujuan ikan",
  },
  {
    number: "03",
    context: "Setelah pembeli menerima",
    title: "Bagian setiap orang jelas",
    body: "Biaya es, angkut, kas KUB, dan bagian nelayan ditulis terpisah. Cicilan hanya dipotong setelah nelayan menyetujuinya.",
    detail: `18 kg × ${formatRupiah(fisherPrice)} = ${formatRupiah(18 * fisherPrice)}`,
  },
];

export function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      className="scroll-mt-20 border-y border-line bg-paper-deep/40"
    >
      <div className="mx-auto flex max-w-[76rem] flex-col gap-10 px-5 py-14 sm:px-8 lg:py-20">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-sm text-ink-2">Cara kerja</p>
            <h2 className="type-title max-w-xl">
              Satu pagi di dermaga.
              <br />
              Semua ada catatannya.
            </h2>
          </div>
          <p className="flex items-center gap-2 text-sm text-ink-2">
            Cerita dan angka contoh <SimulatedTag />
          </p>
        </header>
        <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
          {STEPS.map((step) => (
            <li key={step.number} className="landing-step flex flex-col">
              <p className="mb-5 flex items-center gap-4 text-sm text-ink-2">
                <span className="record-number">{step.number}</span>
                {step.context}
              </p>
              <h3 className="mb-3 font-[family-name:var(--font-display)] text-2xl font-medium leading-tight">
                {step.title}
              </h3>
              <p className="text-ink-2">{step.body}</p>
              <p className="mt-5 border-l-2 border-gold pl-3 text-sm font-medium">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 lg:grid-cols-4">
          {GRADES.map((grade) => (
            <div key={grade} className="flex items-start gap-3">
              <dt>
                <GradeStamp grade={grade} size="sm" />
              </dt>
              <dd className="text-sm leading-snug text-ink-2">
                {GRADE_MEANING[grade]}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
