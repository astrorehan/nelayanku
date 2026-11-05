"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { TextField } from "@/components/ui/fields";
import { Card, SourceNote } from "@/components/ui/surface";
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
    <Card className="flex flex-col gap-6 p-6 sm:p-8">
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
      {example && (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <SourceNote simulated>
            Coba satu kiriman dari KUB Sumber Jaya
          </SourceNote>
          <ButtonLink
            href={`/lacak/${example.code}`}
            variant="quiet"
            icon="qr"
            block
          >
            {example.code}
          </ButtonLink>
        </div>
      )}
    </Card>
  );
}
