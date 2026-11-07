"use client";

import clsx from "clsx";
import { useSyncExternalStore } from "react";
import { Icon } from "@/components/icons/icon";
import { RolePage } from "@/components/layout/role-shell";
import { ProducerTopBar } from "@/components/shells/role-shells";
import { ButtonLink } from "@/components/ui/button";
import { Card, Notice, Pill, SourceNote } from "@/components/ui/surface";
import { PERMIT_STEPS } from "@/data/queries/studio-pages";

export const PERMIT_CHECKLIST_KEY = "nelayanku.studio.permit";

const listeners = new Set<() => void>();

function readRaw(): string {
  try {
    return localStorage.getItem(PERMIT_CHECKLIST_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

// Used when browser storage is blocked: the ticks still work until the page closes.
let memoryFallback: string | null = null;

function snapshot(): string {
  return memoryFallback ?? readRaw();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function write(next: string[]) {
  const raw = JSON.stringify(next);
  try {
    localStorage.setItem(PERMIT_CHECKLIST_KEY, raw);
    memoryFallback = null;
  } catch {
    memoryFallback = raw;
  }
  listeners.forEach((listener) => listener());
}

export function PermitPath() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  const checked = new Set(parse(raw));
  const toggle = (id: string) => {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    write([...next]);
  };
  const stepDone = (index: number) => {
    const step = PERMIT_STEPS[index];
    return step.documents.every((_, docIndex) => checked.has(`${step.id}:${docIndex}`));
  };
  const total = PERMIT_STEPS.reduce((sum, step) => sum + step.documents.length, 0);
  const done = PERMIT_STEPS.reduce(
    (sum, step) => sum + step.documents.filter((_, docIndex) => checked.has(`${step.id}:${docIndex}`)).length,
    0,
  );
  const firstOpen = PERMIT_STEPS.findIndex((_, index) => !stepDone(index));

  return (
    <>
      <ProducerTopBar title="Jalur izin" subtitle="NIB, SPP-IRT, sertifikat halal" />
      <RolePage>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <ol className="flex min-w-0 flex-col">
            {PERMIT_STEPS.map((step, index) => {
              const complete = stepDone(index);
              const current = index === firstOpen;
              return (
                <li key={step.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span
                      aria-hidden
                      className={clsx(
                        "grid size-11 shrink-0 place-items-center rounded-full border font-semibold",
                        complete
                          ? "border-success/25 bg-success-tint text-success-ink"
                          : current
                            ? "border-sky bg-sky-tint text-sea-deep"
                            : "border-line bg-surface text-ink-2",
                      )}
                    >
                      {complete ? <Icon name="check" size={20} /> : index + 1}
                    </span>
                    {index < PERMIT_STEPS.length - 1 && <span aria-hidden className="w-px flex-1 bg-line" />}
                  </div>
                  <Card className={clsx("mb-5 flex min-w-0 flex-1 flex-col gap-4 p-4 sm:p-5", current && "border-sky")}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="flex min-w-0 flex-col">
                        <p className="text-sm font-semibold text-ink-2">Langkah {index + 1}</p>
                        <h2 className="type-h3">{step.title}</h2>
                      </div>
                      {complete && <Pill tone="success">Dokumen lengkap</Pill>}
                    </div>
                    <p className="text-ink-2">{step.purpose}</p>
                    <dl className="grid gap-3 text-sm sm:grid-cols-2">
                      <div className="flex flex-col">
                        <dt className="text-ink-2">Diurus di</dt>
                        <dd className="font-semibold">{step.issuer}</dd>
                      </div>
                      <div className="flex flex-col">
                        <dt className="text-ink-2">Waktu</dt>
                        <dd className="font-semibold">{step.estimate}</dd>
                      </div>
                    </dl>
                    <fieldset className="flex flex-col">
                      <legend className="mb-1 font-semibold">Dokumen yang disiapkan</legend>
                      {step.documents.map((doc, docIndex) => {
                        const id = `${step.id}:${docIndex}`;
                        return (
                          <label key={id} className="flex min-h-12 cursor-pointer items-center gap-3 py-1">
                            <input
                              type="checkbox"
                              className="size-5 shrink-0 accent-[var(--color-sea)]"
                              checked={checked.has(id)}
                              onChange={() => toggle(id)}
                            />
                            <span className={clsx(checked.has(id) && "text-ink-2 line-through")}>{doc}</span>
                          </label>
                        );
                      })}
                    </fieldset>
                    <ButtonLink
                      href={step.url}
                      target="_blank"
                      rel="noreferrer"
                      variant="quiet"
                      size="md"
                      iconAfter="external"
                      className="self-start"
                    >
                      {step.linkLabel}
                    </ButtonLink>
                  </Card>
                </li>
              );
            })}
          </ol>

          <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-6">
            <Card className="flex flex-col gap-2 p-5">
              <p className="text-sm text-ink-2">Persiapan dokumen</p>
              <p className="type-money text-[1.5rem]">
                {done} dari {total}
              </p>
              <div
                role="progressbar"
                aria-label="Persiapan dokumen izin"
                aria-valuemin={0}
                aria-valuemax={total}
                aria-valuenow={done}
                className="h-2 overflow-hidden rounded-full bg-paper-deep"
              >
                <div className="h-full bg-sea" style={{ width: `${(done / total) * 100}%` }} />
              </div>
              <p className="text-sm text-ink-2">Centangan disimpan di perangkat ini saja.</p>
            </Card>
            <Notice tone="warning" title="Ini panduan, bukan layanan izin">
              Nelayanku tidak mengurus atau memverifikasi izin. Syarat dan waktu bisa berbeda tiap daerah, jadi cek
              langsung di situs resmi atau dinas setempat.
            </Notice>
            <SourceNote>
              Checklist label mengacu PerBPOM 31/2018, bukan pengganti pemeriksaan label oleh pihak berwenang.
            </SourceNote>
            <ButtonLink href="/umkm/studio?langkah=4" variant="quiet" icon="edit">
              Isi nomor izin di label
            </ButtonLink>
          </aside>
        </div>
      </RolePage>
    </>
  );
}
