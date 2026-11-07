"use client";

import { useState } from "react";
import { RolePage } from "@/components/layout/role-shell";
import { FisherTopBar } from "@/components/shells/role-shells";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/surface";
import { fisherLandings, groupLandingsByDay } from "@/data/queries/fisher-pages";
import { formatDayDate, formatKg } from "@/lib/format";
import { LandingLink, useFisher } from "./fisher-shared";

const DAYS_PER_PAGE = 8;

export function FisherLandings() {
  const { db, fisher } = useFisher();
  const [shown, setShown] = useState(DAYS_PER_PAGE);
  const groups = groupLandingsByDay(fisherLandings(db, fisher.id));
  const totalKg = groups.reduce((sum, group) => sum + group.totalKg, 0);

  return (
    <>
      <FisherTopBar title="Tangkapan" subtitle={`${groups.length} hari melaut, ${formatKg(totalKg)}`} />
      <RolePage>
        <div className="flex w-full max-w-3xl flex-col gap-6">
          {groups.length === 0 ? (
            <Card tone="paper" className="p-5 text-ink-2">
              Belum ada tangkapan yang dicatat. Setelah Bapak sandar, operator KUB mencatatnya dan hasilnya muncul di
              sini.
            </Card>
          ) : (
            groups.slice(0, shown).map((group) => (
              <section key={group.date} aria-labelledby={`hari-${group.date}`} className="flex flex-col gap-2">
                <h2 id={`hari-${group.date}`} className="flex flex-wrap items-baseline justify-between gap-x-3 type-h3">
                  <span>{formatDayDate(`${group.date}T12:00:00+07:00`)}</span>
                  <span className="text-base font-normal text-ink-2">{formatKg(group.totalKg)}</span>
                </h2>
                <Card className="px-4">
                  {group.rows.map((row) => (
                    <LandingLink key={row.view.landing.id} row={row} />
                  ))}
                </Card>
              </section>
            ))
          )}
          {groups.length > shown && (
            <Button variant="quiet" size="md" block onClick={() => setShown((count) => count + DAYS_PER_PAGE)}>
              Lihat hari sebelumnya ({groups.length - shown})
            </Button>
          )}
        </div>
      </RolePage>
    </>
  );
}
