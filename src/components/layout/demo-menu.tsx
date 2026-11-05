"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/overlays";
import { useDemoNow, useRepository } from "@/data/demo-data-provider";
import { formatClock, formatDayDate } from "@/lib/format";

export const DEMO_ROLES: Array<{ href: string; title: string; who: string; icon: IconName }> = [
  { href: "/kub", title: "Operator KUB", who: "Bu Sari", icon: "scale" },
  { href: "/nelayan", title: "Nelayan", who: "Pak Darman", icon: "boat" },
  { href: "/pembeli", title: "Pembeli", who: "Dapur SPPG Kampung Melayu", icon: "coolBox" },
  { href: "/umkm", title: "Pengolah UMKM", who: "Bu Yanti", icon: "jar" },
];

export function DemoMenuButton({ currentRole, compact = false }: { currentRole: string; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const repository = useRepository();
  const router = useRouter();
  const now = useDemoNow();

  const reset = async () => {
    await repository.resetDemo();
    setConfirmingReset(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <>
      <Button
        variant="quiet"
        size="md"
        icon="people"
        onClick={() => setOpen(true)}
        aria-label="Mode demo: ganti peran atau kembalikan data"
      >
        {compact ? "Demo" : "Demo · ganti peran"}
      </Button>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          setConfirmingReset(false);
        }}
        title="Mode demo"
        description={`Data dan jam di sini simulasi. Sekarang: ${formatDayDate(now)}, ${formatClock(now)} WIB.`}
      >
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="font-semibold">Ganti peran</p>
            {DEMO_ROLES.map((role) => {
              const active = role.title === currentRole;
              return (
                <Link
                  key={role.href}
                  href={role.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className="flex min-h-16 items-center gap-3 rounded-[16px] border border-line bg-surface px-4 transition-colors hover:border-ink aria-[current=page]:border-2 aria-[current=page]:border-ink"
                >
                  <Icon name={role.icon} size={26} className="shrink-0 text-ink-2" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="font-semibold">{role.title}</span>
                    <span className="truncate text-ink-2">{role.who}</span>
                  </span>
                  {active ? (
                    <span className="text-[0.875rem] font-semibold text-ink-2">Sedang dipakai</span>
                  ) : (
                    <Icon name="chevronRight" size={22} className="text-ink-2" />
                  )}
                </Link>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 rounded-[16px] border border-line bg-paper-deep p-4">
            <p className="font-semibold">Kembalikan data demo</p>
            <p className="text-ink-2">Semua yang Anda catat di demo ini dihapus dan cerita kembali ke pukul 05.41.</p>
            {confirmingReset ? (
              <div className="mt-1 grid grid-cols-2 gap-2">
                <Button variant="quiet" size="md" onClick={() => setConfirmingReset(false)}>
                  Batal
                </Button>
                <Button variant="danger" size="md" icon="reset" onClick={reset}>
                  Ya, kembalikan
                </Button>
              </div>
            ) : (
              <Button variant="quiet" size="md" icon="reset" className="mt-1 self-start" onClick={() => setConfirmingReset(true)}>
                Kembalikan data demo
              </Button>
            )}
          </div>
          <Link href="/" onClick={() => setOpen(false)} className="inline-flex min-h-12 items-center gap-2 self-start font-semibold underline underline-offset-4">
            <Icon name="logout" size={20} />
            Keluar ke halaman depan
          </Link>
        </div>
      </Sheet>
    </>
  );
}
