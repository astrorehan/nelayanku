"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/icons/icon";
import { RolePage } from "@/components/layout/role-shell";
import { OperatorTopBar } from "@/components/operator/operator-shell";
import { TextField } from "@/components/ui/fields";
import { Avatar, Card, SourceNote } from "@/components/ui/surface";
import { useDemoDatabase, useDemoNow } from "@/data/demo-data-provider";
import { MEMBER_WINDOW_DAYS, matchesMemberSearch, memberSummaries } from "@/data/queries/operator-pages";
import { formatKg, formatRupiah } from "@/lib/format";

export function MembersView() {
  const db = useDemoDatabase();
  const now = useDemoNow();
  const [query, setQuery] = useState("");
  const members = memberSummaries(db, now);
  const speciesName = (id: string) => db.species.find((species) => species.id === id)?.name ?? "";
  const shown = members.filter((member) => matchesMemberSearch(member, speciesName(member.fisher.usualSpeciesId), query));
  const totalKg = members.reduce((sum, member) => sum + member.kg, 0);

  return (
    <>
      <OperatorTopBar title="Anggota" subtitle={<span className="lg:hidden">{db.kub.name}</span>} />
      <RolePage>
        <div className="grid grid-cols-1 items-end gap-4 lg:grid-cols-[minmax(0,26rem)_1fr]">
          <TextField
            label="Cari anggota"
            type="search"
            inputMode="search"
            placeholder="Nama, nomor anggota, atau jenis ikan"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <p className="text-ink-2 lg:text-right">
            <span className="tabular font-semibold text-ink">{members.length}</span> anggota, total{" "}
            <span className="tabular font-semibold text-ink">{formatKg(totalKg)}</span> mendarat dalam {MEMBER_WINDOW_DAYS} hari
          </p>
        </div>

        {shown.length === 0 ? (
          <Card tone="paper" className="p-5 text-ink-2">
            Tidak ada anggota yang cocok dengan &ldquo;{query}&rdquo;. Coba nama depan atau nomor anggota saja.
          </Card>
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {shown.map((member) => (
              <li key={member.fisher.id}>
                <Link
                  href={`/kub/anggota/${member.fisher.id}`}
                  className="group flex h-full flex-col gap-4 rounded-[20px] border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-paper sm:p-5"
                >
                  <div className="flex items-center gap-3">
                    <Avatar initials={member.fisher.initials} size="lg" />
                    <div className="flex min-w-0 flex-1 flex-col leading-snug">
                      <span className="truncate text-lg font-semibold">Pak {member.fisher.name}</span>
                      <span className="text-ink-2">
                        Anggota <span className="tabular">#{member.fisher.memberNumber}</span> · perahu{" "}
                        <span className="tabular">{member.fisher.boatGrossTonnage}</span> GT
                      </span>
                    </div>
                    <Icon name="chevronRight" size={20} className="shrink-0 text-ink-3 group-hover:text-ink" />
                  </div>
                  <p className="text-ink-2">Biasa membawa {speciesName(member.fisher.usualSpeciesId).toLowerCase()}</p>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t sm:grid-cols-3 border-line pt-3">
                    <div className="flex min-w-0 flex-col-reverse">
                      <dt className="text-sm text-ink-2">{MEMBER_WINDOW_DAYS} hari</dt>
                      <dd className="tabular font-semibold">{formatKg(member.kg)}</dd>
                    </div>
                    <div className="flex min-w-0 flex-col-reverse">
                      <dt className="text-sm text-ink-2">pendapatan</dt>
                      <dd className="tabular font-semibold">{formatRupiah(member.income)}</dd>
                    </div>
                    <div className="col-span-2 flex min-w-0 flex-col-reverse sm:col-span-1">
                      <dt className="text-sm text-ink-2">sisa pinjaman</dt>
                      <dd className="tabular font-semibold">
                        {member.outstandingDebt > 0 ? formatRupiah(member.outstandingDebt) : "Tidak ada"}
                      </dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <SourceNote simulated>Angka dihitung dari catatan demo di perangkat ini.</SourceNote>
      </RolePage>
    </>
  );
}
