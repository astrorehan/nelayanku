import Image from "next/image";
import type { ReactNode } from "react";
import { Icon } from "@/components/icons/icon";
import { Reveal } from "@/components/motion/reveal";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { GRADE_MEANING } from "@/content/labels";
import { LedgerRow } from "@/components/ui/surface";
import { GRADES } from "@/domain/grade";
import { priceBreakdown } from "@/domain/pricing";
import { formatRupiah } from "@/lib/format";
import { EXAMPLE_SPPG_BUYER_PRICE } from "@/content/market-facts";

const fisherPrice = priceBreakdown(EXAMPLE_SPPG_BUYER_PRICE, "sppg").fisherReceivesPerKg;

function Vignette({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-[20px] bg-paper-deep px-6">
      {children}
    </div>
  );
}

function OrderTicket() {
  return (
    <div className="w-full max-w-[15.5rem] -rotate-2 rounded-[16px] border border-line bg-surface p-4 shadow-raised">
      <p className="type-eyebrow flex items-center gap-1.5">
        <Icon name="calendar" size={16} /> Pesanan untuk besok
      </p>
      <p className="mt-2 text-lg font-bold">Tongkol A · 40 kg</p>
      <p className="text-ink-2">Dapur SPPG · kirim 08.00</p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-paper-deep">
        <div className="h-full w-[55%] rounded-full bg-ink" />
      </div>
      <p className="mt-1.5 text-[0.875rem] font-semibold text-ink-2">22 dari 40 kg terisi</p>
    </div>
  );
}

function GradingPhone() {
  return (
    <div className="relative flex w-[8rem] rotate-2 flex-col gap-1.5 rounded-[20px] border-4 border-ink bg-ink p-1 shadow-raised">
      <div className="relative aspect-square overflow-hidden rounded-[14px]">
        <Image
          src="/samples/ffe/kembung-mata-sangat-segar-1.jpg"
          alt="Foto mata ikan kembung yang sangat segar"
          fill
          sizes="140px"
          className="object-cover"
        />
        <span className="absolute inset-[18%] rounded-full border-2 border-dashed border-white/90" />
      </div>
      <div className="flex items-center gap-2 rounded-[12px] bg-paper p-2">
        <GradeStamp grade="A" size="sm" />
        <span className="flex flex-col leading-tight">
          <span className="tabular text-lg font-extrabold">8,2</span>
          <span className="text-[0.75rem] font-semibold text-ink-2">dari 9</span>
        </span>
      </div>
    </div>
  );
}

function PayoutReceipt() {
  return (
    <div className="w-full max-w-[17rem] -rotate-1 rounded-[16px] border border-line bg-surface p-4 shadow-raised">
      <p className="type-eyebrow flex items-center gap-1.5">
        <Icon name="coins" size={16} /> Bagi hasil · Pak Darman
      </p>
      <div className="mt-3 flex flex-col gap-1.5 text-[0.8125rem]">
        <LedgerRow label={`18 kg × ${formatRupiah(fisherPrice)}`} value={formatRupiah(18 * fisherPrice)} />
        <LedgerRow label="Cicilan disetujui" value={`−${formatRupiah(50000)}`} muted />
        <LedgerRow label="Diterima" value={formatRupiah(18 * fisherPrice - 50000)} strong />
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Pembeli pesan sehari sebelumnya",
    body: "Dapur SPPG memesan 40 kg tongkol untuk besok pukul 08.00. KUB tahu pasti apa yang dibutuhkan sebelum kapal berangkat.",
    vignette: <OrderTicket />,
  },
  {
    title: "Ikan dinilai di dermaga",
    body: "Operator memotret mata dan insang. AI di HP memberi skor gaya SNI 2729, tetap jalan tanpa sinyal.",
    vignette: <GradingPhone />,
  },
  {
    title: "Nelayan dibayar adil",
    body: "Uang dibagi per nelayan dengan rincian yang jelas. Potongan utang hanya terjadi kalau nelayan setuju.",
    vignette: <PayoutReceipt />,
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="scroll-mt-20 bg-paper-deep/60">
      <div className="mx-auto flex max-w-[76rem] flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <Reveal className="flex max-w-2xl flex-col gap-3">
          <p className="type-eyebrow">Cara kerja</p>
          <h2 className="type-title">Satu pagi di dermaga, tanpa ada yang terbuang</h2>
        </Reveal>
        <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.08}>
              <li className="flex h-full flex-col gap-4 rounded-[24px] border border-line bg-surface p-4 sm:p-5">
                <Vignette>{step.vignette}</Vignette>
                <div className="flex flex-col gap-2 px-1 pb-1">
                  <p className="type-eyebrow">Langkah {index + 1}</p>
                  <h3 className="type-h2">{step.title}</h3>
                  <p className="text-ink-2">{step.body}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
        <Reveal>
          <div className="grid gap-4 rounded-[24px] border border-line bg-surface p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
            {GRADES.map((grade) => (
              <div key={grade} className="flex items-center gap-4">
                <GradeStamp grade={grade} size="md" />
                <span className="font-semibold leading-snug">{GRADE_MEANING[grade]}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
