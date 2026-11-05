"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Icon, type IconName } from "@/components/icons/icon";
import { DemoMenuButton } from "@/components/layout/demo-menu";
import { ButtonLink } from "@/components/ui/button";
import { useDemoDatabase } from "@/data/demo-data-provider";

const NAV: Array<{
  href: string;
  label: string;
  shortLabel: string;
  icon: IconName;
}> = [
  { href: "/kub", label: "Beranda", shortLabel: "Beranda", icon: "home" },
  {
    href: "/kub/bayar",
    label: "Bayar & buku kas",
    shortLabel: "Bayar",
    icon: "coins",
  },
  {
    href: "/kub/dampak",
    label: "Dampak",
    shortLabel: "Dampak",
    icon: "impact",
  },
];

function isActive(pathname: string, href: string) {
  return href === "/kub"
    ? pathname === "/kub" || pathname.startsWith("/kub/batch")
    : pathname.startsWith(href);
}

export function OperatorShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const db = useDemoDatabase();
  const focusedTask =
    pathname.startsWith("/kub/darat") || pathname.startsWith("/kub/batch/");

  return (
    <div className="operator-shell min-h-dvh lg:grid lg:grid-cols-[16rem_minmax(0,1fr)]">
      <aside className="operator-rail sticky top-0 hidden h-dvh flex-col gap-2 px-5 py-8 lg:flex">
        <Link
          href="/"
          className="mb-5 px-2"
          aria-label="Nelayanku, halaman depan"
        >
          <Logo tone="paper" className="h-6 w-auto" />
          <span className="mt-4 block text-sm text-paper/65">
            Buku kerja nelayan
          </span>
        </Link>
        <ButtonLink
          href="/kub/darat"
          size="lg"
          variant="accent"
          icon="scale"
          block
          className="mb-6 mt-5"
        >
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
                  "flex min-h-10 items-center gap-2 rounded-[8px] px-3 font-semibold transition-colors",
                  active
                    ? "border-l-2 border-gold bg-white/5 text-paper [--icon-signal:var(--color-gold)]"
                    : "border-l-2 border-transparent text-paper/70 hover:bg-white/5 hover:text-paper",
                )}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3 border-t border-paper/20 pt-6">
          <div className="flex flex-col">
            <span className="font-semibold">{db.kub.name}</span>
            <span className="text-paper/65">
              {db.kub.operatorName} · operator
            </span>
          </div>
          <div className="rail-demo">
            <DemoMenuButton currentRole="Operator KUB" compact inverted />
          </div>
        </div>
      </aside>

      <div
        className={clsx(
          "flex min-h-dvh min-w-0 flex-col",
          !focusedTask && "pb-24 lg:pb-0",
        )}
      >
        {children}
      </div>

      {!focusedTask && (
        <nav
          aria-label="Menu operator"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex min-h-[4.5rem] flex-col items-center justify-center gap-1 border-t-2 text-sm font-medium",
                  active
                    ? "border-gold text-ink [--icon-signal:var(--color-gold)]"
                    : "border-transparent text-ink-2",
                )}
              >
                <span className={"grid h-7 w-10 place-items-center"}>
                  <Icon name={item.icon} size={18} />
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

export function OperatorTopBar({
  title,
  subtitle,
  action,
  contextOnly = false,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  contextOnly?: boolean;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-md lg:static lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl items-center gap-3 px-4 py-2 sm:px-6 lg:min-h-20 lg:px-10 lg:pt-6">
        <LogoMark className="h-5 w-auto shrink-0 lg:hidden" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1
            className={clsx(
              "truncate text-lg font-semibold leading-tight",
              !contextOnly && "lg:type-h1",
            )}
          >
            {title}
          </h1>
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
