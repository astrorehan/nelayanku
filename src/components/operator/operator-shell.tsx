"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Icon, type IconName } from "@/components/icons/icon";
import { DemoMenuButton } from "@/components/layout/demo-menu";
import { ButtonLink } from "@/components/ui/button";
import { useDemoDatabase } from "@/data/demo-data-provider";

const NAV: Array<{ href: string; label: string; shortLabel: string; icon: IconName }> = [
  { href: "/kub", label: "Beranda", shortLabel: "Beranda", icon: "home" },
  { href: "/kub/bayar", label: "Bayar & buku kas", shortLabel: "Bayar", icon: "coins" },
  { href: "/kub/dampak", label: "Dampak", shortLabel: "Dampak", icon: "impact" },
];

function isActive(pathname: string, href: string) {
  return href === "/kub" ? pathname === "/kub" || pathname.startsWith("/kub/batch") : pathname.startsWith(href);
}

export function OperatorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const db = useDemoDatabase();
  const inWizard = pathname.startsWith("/kub/darat");

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-2 border-r border-line bg-paper-deep/70 px-4 py-6 lg:flex">
        <Link href="/" className="mb-5 px-2" aria-label="Nelayanku, halaman depan">
          <Logo className="h-7 w-auto" />
        </Link>
        <ButtonLink href="/kub/darat" size="lg" icon="scale" block className="mb-3">
          Catat pendaratan
        </ButtonLink>
        <nav aria-label="Menu operator" className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex min-h-12 items-center gap-3 rounded-[12px] px-3 font-semibold transition-colors",
                  active ? "bg-surface text-ink shadow-hairline ring-1 ring-line [--icon-signal:var(--color-gold)]" : "text-ink-2 hover:bg-surface/70 hover:text-ink",
                )}
              >
                <Icon name={item.icon} size={22} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3 rounded-[16px] border border-line bg-surface p-4">
          <div className="flex flex-col">
            <span className="font-bold">{db.kub.name}</span>
            <span className="text-ink-2">{db.kub.operatorName} · operator</span>
          </div>
          <DemoMenuButton currentRole="Operator KUB" compact />
        </div>
      </aside>

      <div className={clsx("flex min-h-dvh min-w-0 flex-col", !inWizard && "pb-24 lg:pb-0")}>
        {children}
      </div>

      {!inWizard && (
        <nav
          aria-label="Menu operator"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex min-h-[4.5rem] flex-col items-center justify-center gap-1 text-base font-semibold",
                  active ? "text-ink [--icon-signal:var(--color-gold)]" : "text-ink-2",
                )}
              >
                <span className={clsx("grid h-8 w-14 place-items-center rounded-full transition-colors", active && "bg-ink text-paper")}>
                  <Icon name={item.icon} size={22} />
                </span>
                {item.shortLabel}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export function OperatorTopBar({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-md lg:static lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center gap-3 px-4 py-2 sm:px-6 lg:min-h-24 lg:px-10 lg:pt-8">
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="truncate text-lg font-bold leading-tight lg:type-h1">{title}</h1>
          {subtitle && <p className="truncate text-ink-2">{subtitle}</p>}
        </div>
        {action}
        <div className="lg:hidden">
          <DemoMenuButton currentRole="Operator KUB" compact />
        </div>
      </div>
    </header>
  );
}
