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

export interface RoleNavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: IconName;
  /** Extra path prefixes that keep this item highlighted. */
  alsoActiveOn?: readonly string[];
}

export interface RoleIdentity {
  name: string;
  detail: string;
  initials: string;
}

export function initialsOf(name: string) {
  return name
    .replace(/^(Bu|Pak|Ibu|Bapak|Dapur)\s+/i, "")
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function isActive(pathname: string, item: RoleNavItem, root: string) {
  if (item.alsoActiveOn?.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  return item.href === root ? pathname === root : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

const BOTTOM_COLUMNS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
};

/**
 * App frame for a signed-in role: white sidebar with pill menu on desktop,
 * bottom navigation on phones. Pages render their own top bar inside.
 */
export function RoleShell({
  root,
  nav,
  phoneNav,
  navLabel,
  currentRole,
  identity,
  primaryAction,
  isFocusedTask,
  children,
}: {
  root: string;
  nav: readonly RoleNavItem[];
  /** Shorter list for the phone bottom bar (max 5). Defaults to `nav`. */
  phoneNav?: readonly RoleNavItem[];
  navLabel: string;
  currentRole: string;
  identity: RoleIdentity;
  primaryAction?: { href: string; label: string; icon: IconName };
  /** Full-screen task routes hide the bottom navigation on phones. */
  isFocusedTask?: (pathname: string) => boolean;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const focused = isFocusedTask?.(pathname) ?? false;
  const bottomNav = phoneNav ?? nav;

  return (
    <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col gap-2 border-r border-line bg-surface px-4 py-7 lg:flex">
        <Link href="/" className="mb-6 self-start rounded-[12px] px-3 py-1" aria-label="Nelayanku, halaman depan">
          <Logo className="h-6 w-auto" />
        </Link>
        {primaryAction && (
          <ButtonLink href={primaryAction.href} size="lg" icon={primaryAction.icon} block className="mb-6">
            {primaryAction.label}
          </ButtonLink>
        )}
        <p className="mb-1 px-3 text-sm font-semibold text-ink-3">Menu</p>
        <nav aria-label={navLabel} className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = isActive(pathname, item, root);
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
            <Avatar initials={identity.initials} />
            <div className="flex min-w-0 flex-col leading-snug">
              <span className="truncate font-semibold">{identity.name}</span>
              <span className="truncate text-sm text-ink-2">{identity.detail}</span>
            </div>
          </div>
          <DemoMenuButton currentRole={currentRole} compact />
        </div>
      </aside>

      <div className={clsx("flex min-h-dvh min-w-0 flex-col", !focused && "pb-24 lg:pb-0")}>{children}</div>

      {!focused && (
        <nav
          aria-label={navLabel}
          className={clsx(
            "fixed inset-x-0 bottom-0 z-30 grid border-t border-line bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden",
            BOTTOM_COLUMNS[bottomNav.length] ?? "grid-cols-5",
          )}
        >
          {bottomNav.map((item) => {
            const active = isActive(pathname, item, root);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "group flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1 text-sm font-semibold",
                  active ? "text-sea-deep [--icon-signal:var(--color-gold)]" : "text-ink-2",
                )}
              >
                <span
                  className={clsx(
                    "grid h-8 w-14 max-w-full place-items-center rounded-full transition-colors",
                    active && "bg-sky-tint",
                  )}
                >
                  <Icon name={item.icon} size={20} />
                </span>
                <span className="max-w-full truncate px-1">{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

/** Page title bar inside a RoleShell. On desktop it becomes the page heading. */
export function RoleTopBar({
  title,
  subtitle,
  action,
  back,
  currentRole,
  contextOnly = false,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  /** Back link for detail pages. */
  back?: { href: string; label: string };
  currentRole: string;
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
        {back ? (
          <Link
            href={back.href}
            aria-label={back.label}
            className="-ml-2 grid size-11 shrink-0 place-items-center rounded-full text-ink-2 hover:bg-paper hover:text-ink"
          >
            <Icon name="arrowLeft" size={22} />
          </Link>
        ) : (
          <LogoMark className="h-5 w-auto shrink-0 lg:hidden" />
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className={clsx("truncate text-lg font-semibold leading-tight", !contextOnly && "lg:type-h1")}>{title}</h1>
          {subtitle && <p className="truncate text-ink-2">{subtitle}</p>}
        </div>
        {action}
        <div className="lg:hidden">
          <DemoMenuButton currentRole={currentRole} compact />
        </div>
      </div>
    </header>
  );
}

/** Standard content column for role pages. */
export function RolePage({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <main
      id="main-content"
      className={clsx("mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-10 pt-4 sm:px-6 lg:px-10", className)}
    >
      {children}
    </main>
  );
}
