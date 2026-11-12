import { Icon } from "@/components/icons/icon";
import { ParameterBars } from "@/components/grading/score-summary";
import { FillMeter, FreshClock } from "@/components/ui/meters";
import { Card, Pill } from "@/components/ui/surface";
import type { PublicBatchTrace } from "@/data/queries/tracking";
import type { FreshClockStatus } from "@/domain/cold-chain";
import {
  formatClock,
  formatDuration,
  formatFullDate,
  formatKg,
  formatPercent,
  formatScore,
} from "@/lib/format";

const CLOCK_VERDICT: Record<FreshClockStatus, string> = {
  safe: "Masih di dalam batas segar",
  soon: "Mendekati batas segar",
  expired: "Melewati batas segar",
};

export function ColdGauge({ trace }: { trace: PublicBatchTrace }) {
  const cold = trace.cold;
  if (!cold) return null;
  const hours = cold.windowMinutes / 60;
  return (
    <Card className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:gap-5 sm:p-6">
      <FreshClock
        size={80}
        status={cold.status}
        remainingMinutes={cold.remainingMinutes}
        totalMinutes={cold.windowMinutes}
      />
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="type-h3">
          {cold.measuredAtReceipt
            ? "Dari darat sampai diperiksa"
            : "Jam sejak darat"}
        </h2>
        <p className="type-num-l tabular">{formatDuration(cold.elapsedMinutes)}</p>
        <p className="font-semibold leading-snug">{CLOCK_VERDICT[cold.status]}</p>
        <p className="text-[0.9375rem] leading-snug text-ink-2">
          Cincin menunjukkan sisa waktu dari batas demo {hours} jam, {trace.iced ? "ikan pakai es" : "ada ikan tanpa es"}.
          Ini aturan simulasi, bukan pengukuran suhu.
        </p>
      </div>
    </Card>
  );
}

export function ReceiptPanel({ trace }: { trace: PublicBatchTrace }) {
  const { receipt } = trace;
  let body;
  if (receipt && trace.status === "rejected") {
    body = (
      <>
        <Pill tone="danger" icon="close">
          Ditolak
        </Pill>
        <p className="type-h3">0 dari {formatKg(trace.kg)} diterima</p>
        <p className="text-ink-2">
          Alasan tertulis tersimpan pada catatan KUB dan tidak dibuka di
          halaman publik.
        </p>
      </>
    );
  } else if (receipt) {
    const partial = receipt.decision === "accept_partial";
    body = (
      <>
        <Pill tone={partial ? "warning" : "success"} icon="check">
          {partial ? "Diterima sebagian" : "Diterima semua"}
        </Pill>
        <p className="type-h3">
          {formatKg(receipt.acceptedKg)} dari {formatKg(trace.kg)} diterima
        </p>
        <FillMeter
          filled={receipt.acceptedKg}
          target={trace.kg}
          label={`Berat diterima ${formatKg(receipt.acceptedKg)} dari ${formatKg(trace.kg)}`}
        />
        {trace.receivedAt && (
          <p className="text-ink-2">
            Diperiksa {formatClock(trace.receivedAt)} WIB ·{" "}
            {formatFullDate(trace.receivedAt)}
          </p>
        )}
      </>
    );
  } else {
    body = (
      <>
        <Pill tone="info" icon="clock">
          Belum diperiksa
        </Pill>
        <p className="text-ink-2">
          {trace.departedAt
            ? "Kiriman masih di jalan. Hasil penerimaan muncul setelah pembeli memeriksa peti."
            : "Kiriman belum berangkat, jadi belum ada hasil penerimaan."}
        </p>
      </>
    );
  }
  return (
    <Card className="flex flex-col items-start gap-3 p-5 sm:p-6">
      <h2 className="type-h3">Hasil penerimaan</h2>
      {body}
    </Card>
  );
}

export function ParameterPanel({ trace }: { trace: PublicBatchTrace }) {
  if (!trace.parameters) return null;
  return (
    <Card className="flex flex-col gap-4 p-5 sm:p-6">
      <div className="flex flex-col gap-1">
        <h2 className="type-h3">Nilai per parameter</h2>
        <p className="text-ink-2">
          Rata-rata dibobot berat, skala 0 sampai 9.
        </p>
      </div>
      <ParameterBars parameters={trace.parameters} />
      <p className="text-[0.9375rem] leading-snug text-ink-2">
        Mutu kiriman mengikuti mutu terendah dari pendaratan penyusunnya.
      </p>
    </Card>
  );
}

export function ContributionList({ trace }: { trace: PublicBatchTrace }) {
  return (
    <Card className="flex flex-col gap-2 p-5 sm:p-6" aria-labelledby="asal-ikan">
      <h2 id="asal-ikan" className="type-h2">
        Asal dan cap data
      </h2>
      <p className="flex items-start gap-2 text-ink-2">
        <Icon name="shield" size={20} className="mt-0.5 shrink-0 text-sea" />
        Nama nelayan disamarkan menjadi nomor anggota. Kontak, utang, dan harga
        pribadi tidak pernah dibuka di halaman ini.
      </p>
      <div className="mt-2 flex flex-col">
        {trace.contributions.map((item, index) => (
          <details
            key={index}
            className="group border-t border-line first:border-t-0"
          >
            <summary className="grid min-h-14 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3 [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-center gap-2 font-semibold">
                <Icon
                  name="chevronRight"
                  size={18}
                  className="shrink-0 transition-transform group-open:rotate-90"
                />
                {item.fisherLabel}
              </span>
              <span className="tabular text-ink-2">
                {formatKg(item.kg)} · mutu {item.grade}
              </span>
              <span
                aria-hidden
                className="col-span-2 h-2.5 overflow-hidden rounded-full bg-sky-tint"
              >
                <span
                  className="block h-full rounded-full bg-sea"
                  style={{ width: `${Math.max(3, item.share * 100)}%` }}
                />
              </span>
              <span className="col-span-2 text-[0.9375rem] text-ink-2">
                {formatPercent(item.share)} dari isi kiriman
              </span>
            </summary>
            <div className="flex flex-col gap-3 pb-5 pl-0 sm:pl-7">
              <p>
                Darat {formatClock(item.landedAt)} WIB ·{" "}
                {item.iced ? "pakai es" : "tanpa es"} · skor{" "}
                {formatScore(item.score)} dari 9
              </p>
              <ParameterBars parameters={item.parameters} />
              <p className="text-sm text-ink-2">
                Versi penilaian: {item.modelVersion}
              </p>
              {item.gradeAdjusted && (
                <p>Mutu diubah operator; alasan tersimpan pada catatan KUB</p>
              )}
              <p
                className={
                  item.hashMatches ? "text-success-ink" : "text-danger-ink"
                }
              >
                {item.hashMatches
                  ? "Cap cocok dengan isi catatan"
                  : "Cap tidak cocok, periksa dengan operator"}
              </p>
              <code className="break-all text-sm text-ink-2">
                {item.auditHash}
              </code>
            </div>
          </details>
        ))}
      </div>
      <p className="text-sm text-ink-2">
        SHA-256 memeriksa kecocokan isi catatan di browser ini. Cap ini tidak
        membuktikan keaslian pihak pencatat.
      </p>
    </Card>
  );
}
