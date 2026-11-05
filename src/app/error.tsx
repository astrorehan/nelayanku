"use client";

import { Button, ButtonLink } from "@/components/ui/button";

export default function PageError({ reset }: { reset: () => void }) {
  return (
    <main
      id="main-content"
      className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-16"
    >
      <h1 className="type-title">Halaman belum bisa dibuka</h1>
      <p className="text-ink-2">
        Coba muat kembali. Catatan demo yang sudah tersimpan tetap ada di
        perangkat ini.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset} icon="reset">
          Coba lagi
        </Button>
        <ButtonLink href="/" variant="quiet">
          Ke halaman depan
        </ButtonLink>
      </div>
    </main>
  );
}
