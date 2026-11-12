"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons/icon";
import { DEMO_ROLES } from "@/components/layout/demo-menu";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import { Notice } from "@/components/ui/surface";
import { useDemoDatabase, useDemoHydrated, useDemoNow, useRepository } from "@/data/demo-data-provider";
import { roleCardStats } from "@/data/queries/role-cards";

const ROLE_INFO: Record<string, { persona: string; summary: string; start: string }> = {
  "/kub": {
    persona: "Admin KUB Sumber Jaya, Pulau Baai",
    summary: "Catat pendaratan, nilai ikan, isi pesanan, dan bagi hasil.",
    start: "Catat pendaratan pagi ini",
  },
  "/nelayan": {
    persona: "Nelayan tongkol, perahu 3 GT",
    summary: "Lihat uang diterima, sisa utang, dan setujui potongan.",
    start: "Keputusan cicilan di halaman Hari ini",
  },
  "/pembeli": {
    persona: "Pak Hendra, kepala dapur",
    summary: "Pesan ikan untuk besok dan terima kiriman lewat QR.",
    start: "Pesan ikan untuk besok",
  },
  "/umkm": {
    persona: "Pengolah ikan asin dan kerupuk",
    summary: "Ubah ikan mutu C jadi produk berlabel dan siap dijual.",
    start: "Ambil bahan baku mutu C",
  },
};

export const DEMO_PASSWORD = "nelayanku-demo";

const DEMO_ACCOUNTS: Record<string, string> = {
  "operator@demo.nelayanku.id": "/kub",
  "nelayan@demo.nelayanku.id": "/nelayan",
  "pembeli@demo.nelayanku.id": "/pembeli",
  "umkm@demo.nelayanku.id": "/umkm",
};

export function SignInPanel() {
  const router = useRouter();
  const repository = useRepository();
  const db = useDemoDatabase();
  const now = useDemoNow();
  const hydrated = useDemoHydrated();
  const stats = hydrated ? roleCardStats(db, now) : null;
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const destination = DEMO_ACCOUNTS[email.trim().toLowerCase()];
    if (!destination || password !== DEMO_PASSWORD) {
      setError("Email atau kata sandi tidak cocok. Untuk demo, pakai salah satu akun di bawah ini.");
      return;
    }
    router.push(destination);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link href="/juri" className="inline-flex min-h-12 items-center gap-3 rounded-[20px] bg-sky-tint px-5 py-4 font-semibold text-sea-deep"><Icon name="arrowRight" size={22} />Belum tahu mulai dari mana? Ikuti tur</Link>
      <ul className="flex flex-col gap-3">
        {DEMO_ROLES.map((role) => {
          const info = ROLE_INFO[role.href];
          const roleStats = stats?.[role.href as keyof typeof stats];
          return (
            <li key={role.href}>
              <Link
                href={role.href}
                className="group flex flex-col gap-4 rounded-[20px] border border-line bg-surface p-4 transition-[border-color,transform] duration-150 hover:border-sea active:scale-[0.99] sm:p-5"
              >
                <span className="flex items-center gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-sky-tint text-sea-deep">
                    <Icon name={role.icon} size={30} />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="type-h3">
                      {role.title} <span className="font-normal text-ink-2">· {role.who}</span>
                    </span>
                    <span className="text-ink-2">{info.persona}</span>
                  </span>
                  <Icon name="arrowRight" size={24} className="shrink-0 text-ink-2 transition-transform duration-150 group-hover:translate-x-1 group-hover:text-sea" />
                </span>
                <span className="text-ink-2">{info.summary}</span>
                <dl className="grid min-h-16 grid-cols-2 gap-4 border-t border-line pt-4">
                  {[0, 1].map((index) => (
                    <div key={index} className="flex min-w-0 flex-col gap-0.5">
                      <dt className="text-[0.875rem] leading-snug text-ink-2">{roleStats?.[index].label ?? " "}</dt>
                      <dd className="tabular break-words text-lg font-semibold">{roleStats?.[index].value ?? "–"}</dd>
                    </div>
                  ))}
                </dl>
                <span className="font-semibold text-sea">
                  <span className="text-ink-2">Mulai dari </span>
                  {info.start}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="text-[0.875rem] leading-snug text-ink-2">
        Angka di kartu dibaca dari data demo di browser ini dan ikut berubah saat Anda mencatat sesuatu. Semua nama, harga, dan jam adalah simulasi.
      </p>

      <div className="flex items-center gap-4 text-ink-2">
        <span className="h-px flex-1 bg-line" />
        atau
        <span className="h-px flex-1 bg-line" />
      </div>

      {showEmail ? (
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-[20px] border border-line bg-surface p-5 sm:p-6" noValidate>
          <TextField label="Email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />
          <TextField
            label="Kata sandi"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          {error && (
            <p role="alert" className="font-semibold text-danger-ink">
              {error}
            </p>
          )}
          <Button type="submit" size="lg" block>
            Masuk
          </Button>
          <div className="rounded-[14px] bg-paper-deep p-4 text-[0.9375rem] leading-relaxed text-ink-2">
            <p className="font-semibold text-ink">Akun demo</p>
            {Object.keys(DEMO_ACCOUNTS).map((account) => (
              <p key={account} className="type-code">
                {account}
              </p>
            ))}
            <p className="mt-1">
              Kata sandi semua akun: <span className="type-code font-semibold text-ink">{DEMO_PASSWORD}</span>
            </p>
          </div>
        </form>
      ) : (
        <Button variant="quiet" size="lg" block onClick={() => setShowEmail(true)}>
          Masuk dengan email dan kata sandi
        </Button>
      )}

      <div className="mt-4 flex flex-col items-center gap-3 border-t border-line pt-6 text-center">
        {resetDone ? (
          <Notice tone="success" title="Data demo kembali ke awal">
            Cerita mulai lagi dari Kamis, 05.41.
          </Notice>
        ) : confirmingReset ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-ink-2">Semua catatan Anda di demo ini akan dihapus.</p>
            <div className="flex gap-2">
              <Button variant="quiet" size="md" onClick={() => setConfirmingReset(false)}>
                Batal
              </Button>
              <Button
                variant="danger"
                size="md"
                icon="reset"
                onClick={async () => {
                  await repository.resetDemo();
                  setConfirmingReset(false);
                  setResetDone(true);
                }}
              >
                Ya, kembalikan
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="ghost" size="md" icon="reset" onClick={() => setConfirmingReset(true)}>
            Kembalikan data demo ke awal
          </Button>
        )}
      </div>
    </div>
  );
}
