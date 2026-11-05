"use client";

import clsx from "clsx";
import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/surface";
import { DemoMenuButton } from "./demo-menu";

const WIDTHS = { narrow: "max-w-xl", wide: "max-w-6xl" } as const;

export function RoleHeader({
  title,
  subtitle,
  initials,
  currentRole,
  width = "narrow",
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  initials?: string;
  currentRole: string;
  width?: keyof typeof WIDTHS;
  children?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur-md">
      <div className={clsx("mx-auto flex min-h-16 w-full items-center gap-3 px-4 py-2 sm:px-6", WIDTHS[width])}>
        <Link href="/" aria-label="Nelayanku, halaman depan" className="-ml-1 grid size-11 shrink-0 place-items-center rounded-[12px] hover:bg-paper-deep">
          <LogoMark className="h-5 w-auto" />
        </Link>
        {initials && <Avatar initials={initials} />}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-lg font-bold leading-tight">{title}</span>
          {subtitle && <span className="truncate text-ink-2">{subtitle}</span>}
        </div>
        {children}
        <DemoMenuButton currentRole={currentRole} compact />
      </div>
    </header>
  );
}
