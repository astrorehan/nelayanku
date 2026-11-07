"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { Button, ButtonLink } from "@/components/ui/button";
import { Sheet } from "@/components/ui/overlays";
import { Notice, SimulatedTag } from "@/components/ui/surface";
import { useRepository } from "@/data/demo-data-provider";
import { TOUR_STEPS } from "./tour-steps";
import { setTourStep } from "./tour-store";

export function JudgeTour() {
  const repository = useRepository();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const reset = async () => {
    setBusy(true);
    await repository.resetDemo();
    setTourStep(null);
    setConfirming(false);
    setResetDone(true);
    setBusy(false);
  };

  return (
    <>
      <div className="dawn-sky rounded-[32px] px-5 py-8 sm:px-9 sm:py-12">
        <div className="flex items-center gap-3 text-sm font-semibold text-ink-2"><span>PANDUAN JURI · 9 LANGKAH</span><SimulatedTag /></div>
        <h1 className="type-title mt-5 max-w-3xl">Coba Nelayanku dalam 5 menit</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">Dari ikan mendarat sampai nelayan menerima bagiannya. Ikuti satu kiriman dari HP Bu Sari ke dapur pembeli, lalu lihat buku kas Pak Darman dan Studio Bu Yanti. Semua data adalah contoh yang tersimpan di browser Anda.</p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button icon="arrowRight" onClick={() => { setTourStep(0); router.push(TOUR_STEPS[0].href); }}>Mulai tur</Button>
          <Button variant="secondary" icon="reset" onClick={() => setConfirming(true)}>Kembalikan data demo ke awal</Button>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-2">Pertama kali di sini? Data sudah siap. Jika pernah mencoba, kembalikan data ke awal agar angka dan urutan di bawah cocok. Pilih Selanjutnya setelah tindakan selesai.</p>
      </div>
      {resetDone && <Notice tone="success" title="Data demo kembali ke awal">Tur siap dimulai dari Kamis, 5 November 2026, pukul 05.41 WIB.</Notice>}
      <section aria-labelledby="alur-tur" className="grid gap-6 lg:grid-cols-[1fr_18rem] lg:items-start">
        <div className="min-w-0">
          <h2 id="alur-tur" className="type-h2 mb-5">Satu kiriman, empat peran</h2>
          <ol className="divide-y divide-line rounded-[24px] border border-line bg-surface px-5 sm:px-7">
            {TOUR_STEPS.map((step, index) => (
              <li key={step.href} className="flex gap-4 py-6 sm:gap-5">
                <span className="mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-sky-tint font-bold text-sea-deep">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink-2">{step.who}</p>
                  <h3 className="type-h3 mt-1">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-ink-2">{step.action}</p>
                  <p className="mt-3 flex items-start gap-2 leading-relaxed"><Icon name="arrowRight" size={18} className="mt-1 shrink-0 text-sea" /><span>{step.result}</span></p>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-ink-2">PRD {step.features} · simulasi</span>
                    <ButtonLink href={step.href} variant="secondary" size="md" aria-label={`Buka langkah ${index + 1}: ${step.title}`}>Buka</ButtonLink>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <aside className="rounded-[24px] bg-ink p-6 text-white lg:sticky lg:top-24">
          <Icon name="info" size={28} className="text-gold" />
          <h2 className="type-h3 mt-4">Yang sengaja belum ada</h2>
          <ul className="mt-4 flex flex-col gap-4 text-white/80">
            <li>AI masih simulasi untuk enam foto contoh. Model terlatih belum dipasang.</li>
            <li>Tanpa server, login nyata, atau sinkron antarperangkat. Catatan hanya di browser ini.</li>
            <li>Harga, waktu, dan pembayaran adalah simulasi. Tidak ada uang yang dipindahkan.</li>
            <li>Mutu bergaya SNI dan isian izin contoh bukan sertifikasi pangan.</li>
          </ul>
          <Link href="/tentang/model" className="mt-5 inline-flex min-h-12 items-center font-semibold underline underline-offset-4">Baca batas model <Icon name="arrowRight" size={18} className="ml-2" /></Link>
        </aside>
      </section>
      <Sheet open={confirming} onOpenChange={setConfirming} title="Kembalikan data demo?" description="Semua catatan yang Anda buat di demo ini akan dihapus. Cerita dan penanda tur kembali ke awal.">
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <Button variant="quiet" onClick={() => setConfirming(false)} disabled={busy}>Batal</Button>
          <Button variant="danger" icon="reset" busy={busy} disabled={busy} onClick={reset}>Ya, kembalikan</Button>
        </div>
      </Sheet>
    </>
  );
}
