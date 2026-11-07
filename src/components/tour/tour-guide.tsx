"use client";

import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/overlays";
import { TOUR_STEPS } from "./tour-steps";
import { setTourStep, useTourStep } from "./tour-store";

export function TourGuide({ children }: { children: ReactNode }) {
  const stepIndex = useTourStep();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const step = stepIndex === null ? null : TOUR_STEPS[stepIndex];
  // Formulir memiliki tombol di bawah. Bar tur mengambil ruang di atas
  // header agar tidak menutupi kontrol yang sedang dipakai.
  const compact = pathname === "/coba" || pathname === "/kub/darat" || pathname.startsWith("/kub/batch/") || pathname === "/pembeli/pesan" || pathname.startsWith("/pembeli/terima/") || pathname === "/umkm/studio";
  const rolePage = /^\/(kub|nelayan|pembeli|umkm)(\/|$)/.test(pathname);
  const goTo = (index: number) => {
    setTourStep(index);
    setOpen(false);
    router.push(TOUR_STEPS[index].href);
  };
  const end = () => {
    setTourStep(null);
    setOpen(false);
  };
  const bar = step && stepIndex !== null && (
    <aside
      aria-label="Penanda tur juri"
      data-tour-active
      className={clsx(
        "bg-ink text-white",
        compact ? "relative z-30 px-3" : [
          "fixed inset-x-3 z-30 rounded-[24px] p-1.5 shadow-floating sm:inset-x-auto sm:right-6 sm:w-[30rem]",
          rolePage ? "bottom-[calc(5.5rem+env(safe-area-inset-bottom))] lg:bottom-6" : "bottom-[max(1rem,env(safe-area-inset-bottom))]",
        ],
      )}
    >
      <div className={clsx("flex items-center gap-1", compact && "mx-auto max-w-6xl")}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Langkah ${stepIndex + 1} dari ${TOUR_STEPS.length} · ${step.title}. Buka daftar langkah`}
          className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-full px-2 text-left hover:bg-white/10"
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gold text-sm font-bold text-ink">{stepIndex + 1}</span>
          <span className="min-w-0">
            <span className="block text-xs text-white/70">Langkah {stepIndex + 1} dari {TOUR_STEPS.length}</span>
            <span className={clsx("block truncate text-sm font-semibold", compact && "hidden sm:block")}>{step.title}</span>
          </span>
        </button>
        <button type="button" className="min-h-12 shrink-0 rounded-full px-3 text-sm font-semibold hover:bg-white/10" onClick={() => stepIndex === TOUR_STEPS.length - 1 ? end() : goTo(stepIndex + 1)}>
          {stepIndex === TOUR_STEPS.length - 1 ? "Selesai" : "Selanjutnya"}
        </button>
        <button type="button" className="grid size-12 shrink-0 place-items-center rounded-full hover:bg-white/10" aria-label="Akhiri tur" onClick={end}>
          <Icon name="close" size={20} />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {compact && bar}
      {children}
      {!compact && bar && <div aria-hidden className={rolePage ? "h-40 lg:h-24" : "h-24"} />}
      {!compact && bar}
      <Sheet open={open && step !== null} onOpenChange={setOpen} title="Langkah tur juri" description="Selesaikan tindakan di halaman, lalu pilih Selanjutnya. Penanda tidak memeriksa atau mengerjakan tindakan secara otomatis.">
        {step && <p className="mb-5 leading-relaxed text-ink-2">{step.action}</p>}
        <ol className="divide-y divide-line">
          {TOUR_STEPS.map((item, index) => (
            <li key={item.href}>
              <button type="button" onClick={() => goTo(index)} aria-current={index === stepIndex ? "step" : undefined} className="flex min-h-16 w-full items-center gap-3 rounded-[14px] px-3 py-2 text-left hover:bg-paper aria-[current=step]:bg-sky-tint">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-paper font-semibold">{index + 1}</span>
                <span className="min-w-0"><span className="block font-semibold">{item.title}</span><span className="block text-sm text-ink-2">{item.who}</span></span>
              </button>
            </li>
          ))}
        </ol>
        <Button variant="quiet" className="mt-5" onClick={end}>Akhiri tur</Button>
      </Sheet>
    </>
  );
}
