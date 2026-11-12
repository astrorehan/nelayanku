"use client";

import clsx from "clsx";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { SimulatedTag } from "@/components/ui/surface";
import {
  BuyerSlice,
  FisherSlice,
  OperatorSlice,
  StudioSlice,
} from "./app-preview-slices";

interface RoleTab {
  id: string;
  label: string;
  icon: IconName;
  who: string;
  title: string;
  body: string;
  href: string;
  open: string;
  slice: ReactNode;
}

const TABS: readonly RoleTab[] = [
  {
    id: "operator",
    label: "Operator",
    icon: "scale",
    who: "Bu Sari, operator KUB",
    title: "Catat, nilai, dan isi pesanan dari satu layar",
    body: "Setiap kapal yang mendarat ditimbang dan dinilai mutunya, lalu langsung masuk ke pesanan pembeli yang cocok.",
    href: "/kub",
    open: "Buka sebagai Operator",
    slice: <OperatorSlice />,
  },
  {
    id: "nelayan",
    label: "Nelayan",
    icon: "boat",
    who: "Pak Darman, nelayan",
    title: "Tahu bagiannya sebelum dibayar",
    body: "Tangkapan, mutu, dan uang yang akan diterima ditulis terpisah. Cicilan hanya dipotong setelah nelayan setuju.",
    href: "/nelayan",
    open: "Buka sebagai Nelayan",
    slice: <FisherSlice />,
  },
  {
    id: "pembeli",
    label: "Pembeli",
    icon: "coolBox",
    who: "Dapur SPPG Kampung Melayu",
    title: "Pesan, pantau, lalu periksa isi peti",
    body: "Pesanan terlihat dari terisi sampai tiba. Saat kiriman datang, pembeli menerima atau menolak berdasarkan catatan mutu.",
    href: "/pembeli",
    open: "Buka sebagai Pembeli",
    slice: <BuyerSlice />,
  },
  {
    id: "umkm",
    label: "UMKM",
    icon: "jar",
    who: "Bu Yanti, pengolah",
    title: "Ikan mutu C jadi produk dengan modal yang jelas",
    body: "Bahan olahan datang dengan asal dan jam daratnya. Studio menghitung modal, harga, dan label dari bahan itu.",
    href: "/umkm",
    open: "Buka sebagai UMKM",
    slice: <StudioSlice />,
  },
];

export function AppPreview() {
  const [activeId, setActiveId] = useState(TABS[0].id);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = TABS.findIndex((tab) => tab.id === activeId);
  const active = TABS[activeIndex];

  const move = (index: number) => {
    const next = (index + TABS.length) % TABS.length;
    setActiveId(TABS[next].id);
    refs.current[next]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        move(activeIndex + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        move(activeIndex - 1);
        break;
      case "Home":
        event.preventDefault();
        move(0);
        break;
      case "End":
        event.preventDefault();
        move(TABS.length - 1);
        break;
    }
  };

  return (
    <section id="isi-aplikasi" aria-labelledby="isi-aplikasi-judul" className="scroll-mt-20">
      <div className="mx-auto flex max-w-[84rem] flex-col px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line pb-4 text-sm md:grid-cols-3">
          <p className="font-semibold text-sea">Isi aplikasi</p>
          <p className="hidden text-center text-ink-2 md:block">
            Empat peran, satu catatan yang sama
          </p>
          <p className="flex items-center justify-end gap-2 text-ink-2">
            <span className="hidden sm:inline">Data contoh di browser ini</span>
            <SimulatedTag />
          </p>
        </div>

        <header className="mx-auto mt-12 flex max-w-3xl flex-col items-center gap-4 text-center lg:mt-16">
          <h2 id="isi-aplikasi-judul" className="type-title">
            Lihat isi aplikasi
          </h2>
          <p className="max-w-[32rem] text-ink-2 lg:text-lg">
            Potongan layar di bawah bukan gambar. Ia dirender dari komponen
            dan data contoh yang sama dengan halaman perannya.
          </p>
        </header>

        <div
          role="tablist"
          aria-label="Peran di aplikasi"
          onKeyDown={onKeyDown}
          className="mx-auto mt-10 grid w-full max-w-2xl grid-cols-2 gap-2 sm:grid-cols-4"
        >
          {TABS.map((tab, index) => {
            const selected = tab.id === activeId;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  refs.current[index] = node;
                }}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={selected}
                aria-controls="isi-aplikasi-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(tab.id)}
                className={clsx(
                  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border px-4 font-semibold transition-colors",
                  selected
                    ? "border-sea bg-sky-tint text-sea-deep"
                    : "border-line bg-surface text-ink hover:border-line-strong hover:bg-paper",
                )}
              >
                <Icon name={tab.icon} size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id="isi-aplikasi-panel"
          aria-labelledby={`tab-${active.id}`}
          tabIndex={0}
          className="mt-6 flex min-w-0 flex-col gap-6 rounded-[28px] bg-paper p-2 sm:p-6 lg:gap-8 lg:p-8"
        >
          <div className="flex flex-col gap-4 px-2 pt-3 sm:px-0 sm:pt-0 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <div className="flex max-w-2xl flex-col gap-2">
              <p className="type-eyebrow">{active.who}</p>
              <h3 className="type-h1">{active.title}</h3>
              <p className="text-ink-2">{active.body}</p>
            </div>
            <ButtonLink
              href={active.href}
              size="lg"
              iconAfter="arrowRight"
              className="shrink-0 self-start lg:self-auto"
            >
              {active.open}
            </ButtonLink>
          </div>
          {active.slice}
        </div>
      </div>
    </section>
  );
}
