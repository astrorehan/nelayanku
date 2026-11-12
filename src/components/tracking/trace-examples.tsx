"use client";

import Link from "next/link";
import { Icon } from "@/components/icons/icon";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Pill, SourceNote, type PillTone } from "@/components/ui/surface";
import { useDemoDatabase, useDemoHydrated, useDemoNow } from "@/data/demo-data-provider";
import {
  materialExample,
  traceExamples,
  type ExampleOutcome,
  type TraceExample,
} from "@/data/queries/tracking";
import { formatKg } from "@/lib/format";

const OUTCOME: Record<ExampleOutcome, { label: string; tone: PillTone }> = {
  in_transit: { label: "Di jalan", tone: "info" },
  received: { label: "Diterima", tone: "success" },
  partial: { label: "Diterima sebagian", tone: "warning" },
  rejected: { label: "Ditolak", tone: "danger" },
};

function caption(example: TraceExample): string {
  switch (example.outcome) {
    case "in_transit":
      return `Menuju pembeli · ${example.fishers} nelayan`;
    case "received":
      return `Semua diterima · ${example.fishers} nelayan`;
    case "partial":
      return `${formatKg(example.acceptedKg ?? 0)} dari ${formatKg(example.kg)} diterima`;
    case "rejected":
      return "Seluruh kiriman ditolak pembeli";
  }
}

const CARD =
  "group flex min-h-12 flex-col gap-3 rounded-[20px] border border-line bg-surface p-5 transition-colors hover:border-sea focus-visible:border-sea";

export function TraceExamples() {
  const hydrated = useDemoHydrated();
  const db = useDemoDatabase();
  const now = useDemoNow();
  const examples = hydrated ? traceExamples(db, now) : [];
  const material = hydrated ? materialExample(db) : null;
  return (
    <section aria-labelledby="contoh-kiriman" className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h2 id="contoh-kiriman" className="type-h2">
          Contoh kiriman
        </h2>
        <SourceNote simulated>
          Data contoh dari KUB Sumber Jaya. Status dibaca dari catatan di
          browser ini.
        </SourceNote>
      </div>
      {!hydrated ? (
        <p aria-busy="true" className="min-h-48 text-ink-2">
          Membuka contoh kiriman…
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {examples.map((example) => {
            const look = OUTCOME[example.outcome];
            return (
              <li key={example.code} className="flex">
                <Link href={`/lacak/${example.code}`} className={`${CARD} w-full`}>
                  <span className="flex items-center justify-between gap-3">
                    <Pill tone={look.tone}>{look.label}</Pill>
                    {example.grade && <GradeStamp grade={example.grade} size="sm" />}
                  </span>
                  <span className="type-code break-all">{example.code}</span>
                  <span className="flex flex-col gap-0.5">
                    <span className="font-semibold">
                      {example.species} · {formatKg(example.kg)}
                    </span>
                    <span className="text-ink-2">{caption(example)}</span>
                  </span>
                  <span className="mt-auto flex items-center gap-1.5 pt-1 font-semibold text-sea">
                    Buka bukti mutu
                    <Icon
                      name="arrowRight"
                      size={18}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
          {material && (
            <li className="flex sm:col-span-2">
              <Link
                href={`/lacak/bahan/${material.id}`}
                className={`${CARD} w-full sm:flex-row sm:items-center sm:gap-5`}
              >
                <span
                  aria-hidden
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-sky-tint text-sea"
                >
                  <Icon name="jar" size={26} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="type-eyebrow">Asal bahan olahan</span>
                  <span className="font-semibold">
                    Bahan untuk {material.productName}
                  </span>
                  <span className="text-ink-2">
                    {material.species} · {formatKg(material.kg)} sebelum diolah
                  </span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-sea">
                  Lihat asal
                  <Icon name="arrowRight" size={18} />
                </span>
              </Link>
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
