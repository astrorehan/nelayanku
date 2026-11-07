"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons/icon";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import { Card } from "@/components/ui/surface";
import { useDemoDatabase } from "@/data/demo-data-provider";
import { parseTrackingCode } from "@/data/queries/tracking";

export function TraceEntry() {
  const router = useRouter();
  const db = useDemoDatabase();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const example = db.batches.find((batch) => batch.status === "in_transit");
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const parsed = parseTrackingCode(code);
    if (!parsed) {
      setError("Isi kode pada label atau tempel tautan lacak kiriman");
      return;
    }
    router.push(`/lacak/${encodeURIComponent(parsed)}`);
  };
  return (
    <Card className="flex flex-col gap-5 p-5 sm:p-6">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <TextField
          label="Kode kiriman"
          value={code}
          onChange={(event) => {
            setCode(event.target.value);
            setError("");
          }}
          placeholder={example?.code}
          autoComplete="off"
          spellCheck={false}
          error={error}
          hint="Ada di bawah QR pada label. Bisa juga tempel tautan lacak."
          required
        />
        <Button type="submit" size="xl" icon="search" block>
          Lihat bukti mutu
        </Button>
      </form>
      <p className="text-ink-2">
        Untuk memindai QR, gunakan kamera HP, lalu buka tautan yang muncul
      </p>
      <p className="flex items-start gap-2 border-t border-line pt-4 text-ink-2">
        <Icon name="shield" size={20} className="mt-0.5 shrink-0 text-sea" />
        Nama nelayan disamarkan jadi nomor anggota. Kontak, utang, harga
        pribadi, dan alasan tertulis tidak pernah dibuka di halaman lacak.
      </p>
    </Card>
  );
}
