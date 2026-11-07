"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { OperatorTopBar } from "@/components/operator/operator-shell";
import { OrderCard } from "@/components/operator/order-card";
import { RolePage } from "@/components/layout/role-shell";
import { Card, Notice, Pill } from "@/components/ui/surface";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { localDateOf } from "@/data/demo-clock";
import {
  allBatchViews,
  attentionItems,
  countByFilter,
  groupOrdersByDay,
  orderFilterOf,
  ORDER_FILTERS,
  type AttentionKind,
  type OrderFilter,
} from "@/data/queries/operator-pages";
import { formatDayDate } from "@/lib/format";

const EMPTY_COPY: Record<OrderFilter, string> = {
  aktif: "Belum ada pesanan yang sedang diisi. Pesanan baru dari pembeli muncul di sini setelah masuk.",
  jalan: "Tidak ada kiriman di jalan sekarang. Kiriman muncul di sini setelah checklist kirim selesai.",
  selesai: "Belum ada pesanan yang selesai.",
  ditolak: "Tidak ada pesanan yang ditolak. Kalau pembeli menolak, catatannya muncul di sini.",
};

const ATTENTION_TONE: Record<AttentionKind, "danger" | "warning"> = {
  rejected: "danger",
  partial: "warning",
  late_payment: "warning",
  not_full: "warning",
};

const ATTENTION_ICON = {
  rejected: "warning",
  partial: "warning",
  late_payment: "coins",
  not_full: "crate",
} as const;

function dayHeading(date: string, today: string) {
  const label = formatDayDate(`${date}T12:00:00+07:00`);
  if (date === today) {
    return `Hari ini, ${label}`;
  }
  return label;
}

export function OrdersView() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const [filter, setFilter] = useState<OrderFilter>("aktif");
  const today = localDateOf(now);
  const views = allBatchViews(db, now);
  const counts = countByFilter(views);
  const attention = attentionItems(db, now);
  const days = groupOrdersByDay(views.filter((view) => orderFilterOf(view) === filter));
  const shown = days.reduce((sum, day) => sum + day.views.length, 0);

  return (
    <>
      <OperatorTopBar title="Pesanan & batch" subtitle={<span className="lg:hidden">{db.kub.name}</span>} />
      <RolePage>
        <section aria-labelledby="perlu-ditangani" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="perlu-ditangani" className="type-h2">
              Perlu ditangani
            </h2>
            <span className="record-number">{attention.length} hal</span>
          </div>
          {attention.length === 0 ? (
            <Notice tone="success" title="Tidak ada yang menunggu">
              Tidak ada penolakan, pembayaran terlambat, atau batch yang kurang saat mendekati batas isi.
            </Notice>
          ) : (
            <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {attention.map((item) => (
                <li key={`${item.kind}-${item.batchId}`}>
                  <Link
                    href={`/kub/batch/${item.batchId}`}
                    className={`flex min-h-16 items-center gap-3 rounded-[18px] border p-4 transition-colors ${
                      ATTENTION_TONE[item.kind] === "danger"
                        ? "border-danger/30 bg-danger-tint hover:bg-danger-tint/70"
                        : "border-[#efc65c] bg-warning-tint hover:bg-warning-tint/70"
                    }`}
                  >
                    <Icon
                      name={ATTENTION_ICON[item.kind]}
                      size={24}
                      className={ATTENTION_TONE[item.kind] === "danger" ? "shrink-0 text-danger-ink" : "shrink-0 text-warning-ink"}
                    />
                    <span className="flex min-w-0 flex-1 flex-col leading-snug">
                      <span className="font-semibold">{item.title}</span>
                      <span className="text-ink-2">{item.detail}</span>
                    </span>
                    <Icon name="chevronRight" size={18} className="shrink-0 text-ink-2" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="semua-pesanan" className="flex flex-col gap-4">
          <h2 id="semua-pesanan" className="type-h2">
            Semua pesanan
          </h2>
          <div role="group" aria-label="Status pesanan" className="flex flex-wrap gap-2">
            {ORDER_FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
                className={clsx(
                  "inline-flex min-h-12 items-center gap-2 rounded-full border px-5 font-semibold transition-colors",
                  filter === option.value
                    ? "border-transparent bg-sky-tint text-sea-deep"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong hover:text-ink",
                )}
              >
                {option.title}
                <span className="tabular text-sm font-normal text-ink-3">{counts[option.value]}</span>
              </button>
            ))}
          </div>
          {shown === 0 ? (
            <Card tone="paper" className="p-5 text-ink-2">
              {EMPTY_COPY[filter]}
            </Card>
          ) : (
            <div className="flex flex-col gap-6">
              {days.map((day) => (
                <div key={day.date} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="type-h3">{dayHeading(day.date, today)}</h3>
                    <Pill>{day.views.length} pesanan</Pill>
                  </div>
                  <div className="panel overflow-hidden">
                    {day.views.map((view) => (
                      <div key={view.batch.id} className="border-t border-line first:border-t-0">
                        <OrderCard view={view} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </RolePage>
    </>
  );
}
