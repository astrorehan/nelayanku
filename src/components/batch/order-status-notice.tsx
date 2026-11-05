import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/icons/icon";
import { Notice } from "@/components/ui/surface";
import type { BatchView } from "@/data/queries/batches";
import {
  formatClock,
  formatKg,
  formatRupiah,
  formatScore,
  formatShortDate,
} from "@/lib/format";

function PaymentLine({ view }: { view: BatchView }) {
  const payment = view.payment;
  if (!payment) {
    return null;
  }
  if (payment.status === "late") {
    return (
      <p className="font-semibold text-warning-ink">
        Pembayaran {formatRupiah(payment.amount)} terlambat. Jatuh tempo{" "}
        {formatShortDate(payment.dueAt)}.
      </p>
    );
  }
  if (payment.paidAt) {
    return (
      <p>
        Dibayar {formatRupiah(payment.amount)} ·{" "}
        {formatShortDate(payment.paidAt)} {formatClock(payment.paidAt)}
      </p>
    );
  }
  return <p>Uang muka diterima. Sisa dibayar setelah ikan diterima.</p>;
}

export function OrderStatusNotice({ view }: { view: BatchView }) {
  const { batch, receipt } = view;
  switch (batch.status) {
    case "in_transit":
      return (
        <Notice
          tone="info"
          icon="courier"
          title={`Dalam perjalanan sejak ${formatClock(batch.departedAt!)}`}
        >
          Kurir {batch.checklist?.courier}. Pembeli memeriksa ulang saat
          menerima.
        </Notice>
      );
    case "received":
      return (
        <Notice
          tone="success"
          title={`Diterima ${receipt ? formatClock(receipt.receivedAt) : ""}`.trim()}
        >
          <div className="flex flex-col gap-1">
            <p>
              {receipt?.decision === "accept_partial"
                ? `${formatKg(receipt.acceptedKg)} dari ${formatKg(view.filledKg)} diterima. Alasan: ${receipt.reason?.toLowerCase()}.`
                : `Semua ${formatKg(view.filledKg)} diterima.`}
              {receipt?.recheckScore
                ? ` Skor cek ulang ${formatScore(receipt.recheckScore)}.`
                : ""}
            </p>
            <PaymentLine view={view} />
            <Link
              href="/kub/bayar"
              className="inline-flex min-h-11 items-center gap-1 self-start font-semibold text-ink underline underline-offset-4"
            >
              Lihat bagi hasil
              <Icon name="arrowRight" size={18} />
            </Link>
          </div>
        </Notice>
      );
    case "rejected":
      return (
        <Notice tone="danger" title="Ditolak pembeli">
          <div className="flex flex-col gap-3">
            <p>
              {receipt?.reason
                ? `Alasan: ${receipt.reason.toLowerCase()}`
                : "Pembeli menolak kiriman ini"}
            </p>
            {receipt?.note && <p>{receipt.note}</p>}
            {receipt?.evidencePhotoDataUrl && (
              <Image
                src={receipt.evidencePhotoDataUrl}
                width={240}
                height={180}
                alt="Bukti penolakan dari pembeli"
                unoptimized
                className="max-h-48 rounded-[12px] object-contain"
              />
            )}
          </div>
        </Notice>
      );
    case "cancelled":
      return (
        <Notice tone="neutral" title="Dibatalkan, ikan dijual ke TPI">
          Pembeli diberi tahu dan uang muka dikembalikan.
        </Notice>
      );
    default:
      return null;
  }
}
