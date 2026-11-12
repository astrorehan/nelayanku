"use client";

import type { ReactNode } from "react";
import { initialsOf, RoleShell, RoleTopBar, type RoleNavItem } from "@/components/layout/role-shell";
import { useDemoDatabase } from "@/data/demo-data-provider";

export const OPERATOR_ROLE = "Operator KUB";

const NAV: readonly RoleNavItem[] = [
  { href: "/kub", label: "Beranda", shortLabel: "Beranda", icon: "home", alsoActiveOn: ["/kub/pendaratan"] },
  { href: "/kub/pesanan", label: "Pesanan & batch", shortLabel: "Pesanan", icon: "crate", alsoActiveOn: ["/kub/batch"] },
  { href: "/kub/harga", label: "Harga hari ini", shortLabel: "Harga", icon: "tag" },
  { href: "/kub/anggota", label: "Anggota", shortLabel: "Anggota", icon: "people" },
  { href: "/kub/bayar", label: "Bayar & buku kas", shortLabel: "Bayar", icon: "coins" },
  { href: "/kub/dampak", label: "Dampak", shortLabel: "Dampak", icon: "impact" },
];

/** Phones show five items; Dampak stays reachable from the sidebar and Beranda. */
const PHONE_NAV = NAV.filter((item) => item.href !== "/kub/dampak");

export function OperatorShell({ children }: { children: ReactNode }) {
  const db = useDemoDatabase();
  return (
    <RoleShell
      root="/kub"
      nav={NAV}
      phoneNav={PHONE_NAV}
      navLabel="Menu operator"
      currentRole={OPERATOR_ROLE}
      identity={{ name: db.kub.name, detail: `${db.kub.operatorName}, operator`, initials: initialsOf(db.kub.operatorName) }}
      primaryAction={{ href: "/kub/darat", label: "Catat pendaratan", icon: "scale" }}
      isFocusedTask={(pathname) => pathname.startsWith("/kub/darat") || pathname.startsWith("/kub/batch/")}
    >
      {children}
    </RoleShell>
  );
}

export function OperatorTopBar(props: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  back?: { href: string; label: string };
  contextOnly?: boolean;
}) {
  return <RoleTopBar {...props} currentRole={OPERATOR_ROLE} />;
}
