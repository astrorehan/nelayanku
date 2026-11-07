"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { DOCUMENT_ICON, PrintDocumentButton } from "@/components/documents/buyer-documents";
import { RolePage } from "@/components/layout/role-shell";
import { BATCH_STATUS_PILL } from "@/components/operator/order-card";
import { BuyerTopBar } from "@/components/shells/role-shells";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, Pill, SourceNote } from "@/components/ui/surface";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { DEMO_BUYER_ID } from "@/data/demo-identities";
import { batchesForBuyer, type BatchView } from "@/data/queries/batches";
import { documentsFor, orderKg } from "@/data/queries/buyer-pages";
import { formatKg, formatShortDayDate } from "@/lib/format";

const PAGE_SIZE = 8;

function BatchDocuments({ view }: { view: BatchView }) {
  const status = BATCH_STATUS_PILL[view.batch.status];
  const documents = documentsFor(view);
  return (
    <Card className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/pembeli/pesanan/${view.batch.code}`}
          className="flex min-w-0 flex-col rounded-[12px] hover:underline"
        >
          <span className="type-h3">
            {view.species.name} · {formatKg(orderKg(view) || view.filledKg)}
          </span>
          <span className="text-ink-2">
            {formatShortDayDate(view.order.deliverAt)} ·{" "}
            <span className="type-code">{view.batch.code}</span>
          </span>
        </Link>
        <Pill tone={status.tone}>{status.label}</Pill>
      </div>
      <ul className="flex flex-col divide-y divide-line">
        {documents.map((document) => (
          <li key={document.kind} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2.5">
            <Icon name={DOCUMENT_ICON[document.kind]} size={22} className="shrink-0 text-ink-2" />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="font-semibold">{document.title}</span>
              {!document.available && (
                <span className="text-ink-2">{document.unavailableReason}</span>
              )}
            </span>
            {document.kind === "mutu" && document.available && (
              <ButtonLink
                href={`/lacak/${view.batch.code}`}
                variant="ghost"
                size="md"
                icon="shield"
                aria-label={`Lihat bukti mutu ${view.batch.code}`}
              >
                Lihat
              </ButtonLink>
            )}
            <PrintDocumentButton kind={document.kind} view={view} label="Cetak / PDF" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function BuyerDocumentsView() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const [shown, setShown] = useState(PAGE_SIZE);
  const views = batchesForBuyer(db, DEMO_BUYER_ID, now).filter(
    (view) => view.batch.status !== "cancelled",
  );
  const withDocs = views.filter((view) => documentsFor(view).some((document) => document.available));

  return (
    <>
      <BuyerTopBar title="Dokumen & faktur" subtitle={`${withDocs.length} kiriman punya dokumen`} />
      <RolePage>
        <SourceNote simulated>
          Dokumen dibuat dari data demo. Pilih Cetak / PDF, lalu simpan sebagai PDF dari menu cetak peramban. Bukan
          faktur pajak atau bukti transfer.
        </SourceNote>
        {views.length === 0 ? (
          <Card tone="paper" className="flex flex-col items-start gap-3 p-5">
            <p className="font-semibold">Belum ada dokumen</p>
            <p className="text-ink-2">Dokumen muncul setelah ada pesanan yang diisi atau diterima.</p>
            <ButtonLink href="/pembeli/pesan" icon="plus">
              Pesan untuk besok
            </ButtonLink>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {views.slice(0, shown).map((view) => (
              <BatchDocuments key={view.batch.id} view={view} />
            ))}
          </div>
        )}
        {views.length > shown && (
          <Button
            variant="quiet"
            size="md"
            block
            onClick={() => setShown((count) => count + PAGE_SIZE)}
          >
            Lihat lebih banyak ({views.length - shown})
          </Button>
        )}
      </RolePage>
    </>
  );
}
