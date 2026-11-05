"use client";

import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { Icon, type IconName } from "@/components/icons/icon";
import { DemoMenuButton } from "@/components/layout/demo-menu";
import { ButtonLink } from "@/components/ui/button";
import { Avatar } from "@/components/ui/surface";
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

function initialsOf(name: string) {
  return name
    .replace(/^(Bu|Pak|Ibu|Bapak)\s+/i, "")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

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
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-2 border-r border-line bg-surface px-4 py-7 lg:flex">
        <Link
          href="/"
          className="mb-6 self-start rounded-[12px] px-3 py-1"
          aria-label="Nelayanku, halaman depan"
        >
          <Logo className="h-6 w-auto" />
        </Link>
        <ButtonLink
          href="/kub/darat"
          size="lg"
          icon="scale"
          block
          className="mb-6"
        >
          Catat pendaratan
        </ButtonLink>
        <p className="mb-1 px-3 text-sm font-semibold text-ink-3">Menu</p>
        <nav aria-label="Menu operator" className="flex flex-col gap-1">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex min-h-12 items-center gap-3 rounded-full px-4 font-semibold transition-colors",
                  active
                    ? "bg-sky-tint text-sea-deep [--icon-signal:var(--color-gold)]"
                    : "text-ink-2 hover:bg-paper hover:text-ink",
                )}
              >
                <Icon name={item.icon} size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-4 rounded-[20px] bg-paper p-4">
          <div className="flex items-center gap-3">
            <Avatar initials={initialsOf(db.kub.operatorName)} />
            <div className="flex min-w-0 flex-col leading-snug">
              <span className="truncate font-semibold">{db.kub.name}</span>
              <span className="truncate text-sm text-ink-2">
                {db.kub.operatorName}, operator
              </span>
            </div>
          </div>
          <DemoMenuButton currentRole="Operator KUB" compact />
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
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-line bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        >
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "group flex min-h-[4.5rem] flex-col items-center justify-center gap-1 text-sm font-semibold",
                  active
                    ? "text-sea-deep [--icon-signal:var(--color-gold)]"
                    : "text-ink-2",
                )}
              >
                <span
                  className={clsx(
                    "grid h-8 w-14 place-items-center rounded-full transition-colors",
                    active && "bg-sky-tint",
                  )}
                >
                  <Icon name={item.icon} size={20} />
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
    <header
      className={clsx(
        "sticky top-0 z-20 border-b border-line bg-surface/95 backdrop-blur-md lg:static lg:border-b-0 lg:bg-transparent lg:backdrop-blur-none",
        contextOnly && "lg:sr-only",
      )}
    >
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
