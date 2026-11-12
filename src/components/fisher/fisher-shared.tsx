"use client";

import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { ButtonLink } from "@/components/ui/button";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Card, Pill, type PillTone } from "@/components/ui/surface";
import { useDemoDatabase } from "@/data/demo-data-provider";
import { DEMO_FISHER_ID } from "@/data/demo-identities";
import type { FisherLandingRow, LandingStatusKind } from "@/data/queries/fisher-pages";
import type { LedgerEntry } from "@/data/types";
import { formatClock, formatKg } from "@/lib/format";

/** The demo fisher (Darman). Throws only if the seed is broken. */
export function useFisher() {
  const db = useDemoDatabase();
  const fisher = db.fishers.find((candidate) => candidate.id === DEMO_FISHER_ID)!;
  return { db, fisher };
}

const STATUS_TONE: Record<LandingStatusKind, PillTone> = {
  waiting: "warning",
  in_batch: "info",
  paid: "success",
  processing: "neutral",
  port: "neutral",
  not_edible: "danger",
  rejected: "danger",
};

export function StatusPill({ kind, label }: { kind: LandingStatusKind; label: string }) {
  return <Pill tone={STATUS_TONE[kind]}>{label}</Pill>;
}

/** One landing as a tappable row that opens its detail page. */
export function LandingLink({ row }: { row: FisherLandingRow }) {
  const { view, status } = row;
  return (
    <Link
      href={`/nelayan/tangkapan/${view.landing.id}`}
      className="flex min-h-[4.5rem] items-center gap-3 border-b border-line py-3 last:border-b-0 hover:bg-paper"
    >
      {view.grading ? <GradeStamp grade={view.grading.grade} size="sm" /> : <Pill tone="warning">Belum</Pill>}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="font-semibold">
          {formatKg(view.landing.weightKg)} {view.species.name.toLowerCase()}
        </span>
        <span className="text-ink-2">
          Darat {formatClock(view.landing.landedAt)}
          {view.grading ? ` · skor ${view.grading.finalScore.toFixed(1).replace(".", ",")}` : ""}
        </span>
        <span>
          <StatusPill kind={status.kind} label={status.label} />
        </span>
      </span>
      <Icon name="chevronRight" size={20} className="shrink-0 text-ink-3" />
    </Link>
  );
}

export function NotFoundCard({ title, back }: { title: string; back: { href: string; label: string } }) {
  return (
    <Card tone="paper" className="flex flex-col items-start gap-3 p-6">
      <h2 className="type-h3">{title}</h2>
      <p className="text-ink-2">
        Catatannya tidak ada di data Bapak. Mungkin alamatnya salah, atau demo sudah direset.
      </p>
      <ButtonLink href={back.href} variant="secondary" icon="arrowLeft">
        {back.label}
      </ButtonLink>
    </Card>
  );
}

export function approvalLabel(entry: LedgerEntry): {
  label: string;
  tone: PillTone;
} {
  switch (entry.approval) {
    case "approved_by_link":
      return { label: "Disetujui", tone: "success" };
    case "approved_verbally":
      return { label: "Disetujui lisan", tone: "success" };
    case "declined":
      return { label: "Ditolak", tone: "neutral" };
    case "pending":
      return { label: "Menunggu jawaban", tone: "warning" };
    default:
      return { label: "Dicatat", tone: "neutral" };
  }
}
