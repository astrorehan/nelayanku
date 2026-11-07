"use client";

import type { ReactNode } from "react";
import { initialsOf, RoleShell, RoleTopBar, type RoleNavItem } from "@/components/layout/role-shell";
import { useDemoDatabase } from "@/data/demo-data-provider";
import { DEMO_BUYER_ID, DEMO_FISHER_ID, DEMO_PRODUCER_ID } from "@/data/demo-identities";

export const FISHER_ROLE = "Nelayan";
export const BUYER_ROLE = "Pembeli";
export const PRODUCER_ROLE = "Pengolah UMKM";

const FISHER_NAV: readonly RoleNavItem[] = [
  { href: "/nelayan", label: "Hari ini", shortLabel: "Hari ini", icon: "home" },
  { href: "/nelayan/tangkapan", label: "Tangkapan", shortLabel: "Tangkapan", icon: "fish" },
  { href: "/nelayan/uang", label: "Uang masuk", shortLabel: "Uang", icon: "coins" },
  { href: "/nelayan/pinjaman", label: "Pinjaman", shortLabel: "Pinjaman", icon: "ledger" },
  { href: "/nelayan/harga", label: "Harga ikan", shortLabel: "Harga", icon: "tag" },
];

const BUYER_NAV: readonly RoleNavItem[] = [
  { href: "/pembeli", label: "Ringkasan", shortLabel: "Ringkasan", icon: "home" },
  {
    href: "/pembeli/pesanan",
    label: "Pesanan",
    shortLabel: "Pesanan",
    icon: "crate",
    alsoActiveOn: ["/pembeli/terima", "/pembeli/pesan"],
  },
  { href: "/pembeli/dokumen", label: "Dokumen & faktur", shortLabel: "Dokumen", icon: "document" },
  { href: "/pembeli/harga", label: "Harga ikan", shortLabel: "Harga", icon: "tag" },
];

const PRODUCER_NAV: readonly RoleNavItem[] = [
  { href: "/umkm", label: "Beranda studio", shortLabel: "Beranda", icon: "home" },
  { href: "/umkm/bahan", label: "Bahan baku", shortLabel: "Bahan", icon: "fish" },
  {
    href: "/umkm/produk",
    label: "Produk",
    shortLabel: "Produk",
    icon: "jar",
    alsoActiveOn: ["/umkm/studio"],
  },
  { href: "/umkm/izin", label: "Jalur izin", shortLabel: "Izin", icon: "shield" },
];

export function FisherShell({ children }: { children: ReactNode }) {
  const db = useDemoDatabase();
  const fisher = db.fishers.find((item) => item.id === DEMO_FISHER_ID);
  const name = fisher ? `Pak ${fisher.name}` : "Nelayan";
  return (
    <RoleShell
      root="/nelayan"
      nav={FISHER_NAV}
      navLabel="Menu nelayan"
      currentRole={FISHER_ROLE}
      identity={{ name, detail: db.kub.name, initials: fisher?.initials ?? initialsOf(name) }}
    >
      {children}
    </RoleShell>
  );
}

export function BuyerShell({ children }: { children: ReactNode }) {
  const db = useDemoDatabase();
  const buyer = db.buyers.find((item) => item.id === DEMO_BUYER_ID);
  return (
    <RoleShell
      root="/pembeli"
      nav={BUYER_NAV}
      navLabel="Menu pembeli"
      currentRole={BUYER_ROLE}
      identity={{
        name: buyer?.name ?? "Pembeli",
        detail: buyer ? `${buyer.contactName}, pembeli` : "pembeli",
        initials: initialsOf(buyer?.name ?? "Pembeli"),
      }}
      primaryAction={{ href: "/pembeli/pesan", label: "Pesan untuk besok", icon: "plus" }}
      isFocusedTask={(pathname) => pathname.startsWith("/pembeli/pesan") && !pathname.startsWith("/pembeli/pesanan")}
    >
      {children}
    </RoleShell>
  );
}

export function ProducerShell({ children }: { children: ReactNode }) {
  const db = useDemoDatabase();
  const producer = db.producers.find((item) => item.id === DEMO_PRODUCER_ID);
  const name = producer?.name ?? "Pengolah UMKM";
  return (
    <RoleShell
      root="/umkm"
      nav={PRODUCER_NAV}
      navLabel="Menu studio UMKM"
      currentRole={PRODUCER_ROLE}
      identity={{ name, detail: `Pengolah · ${db.kub.name}`, initials: initialsOf(name) }}
      primaryAction={{ href: "/umkm/studio", label: "Produk baru", icon: "plus" }}
      isFocusedTask={(pathname) => pathname.startsWith("/umkm/studio")}
    >
      {children}
    </RoleShell>
  );
}

type TopBarProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  back?: { href: string; label: string };
  contextOnly?: boolean;
};

export const FisherTopBar = (props: TopBarProps) => <RoleTopBar {...props} currentRole={FISHER_ROLE} />;
export const BuyerTopBar = (props: TopBarProps) => <RoleTopBar {...props} currentRole={BUYER_ROLE} />;
export const ProducerTopBar = (props: TopBarProps) => <RoleTopBar {...props} currentRole={PRODUCER_ROLE} />;
