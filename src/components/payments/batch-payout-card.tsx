import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";
import { Icon } from "@/components/icons/icon";
import { RoleHandoff } from "@/components/layout/role-handoff";
import { GradeStamp } from "@/components/ui/grade-stamp";
import { Avatar, Card, Pill, type PillTone } from "@/components/ui/surface";
import type { BatchPayout } from "@/data/queries/fishers";
import { DEMO_FISHER_ID } from "@/data/demo-identities";
import type { Fisher, PaymentStatus } from "@/data/types";
import type { RevenueShareLine } from "@/domain/revenue-share";
import { formatKg, formatRupiah, formatShortDayDate } from "@/lib/format";

const PAYMENT_PILL: Record<PaymentStatus, { label: string; tone: PillTone }> = {
  paid: { label: "Lunas", tone: "success" },
  late: { label: "Terlambat", tone: "warning" },
  down_payment: { label: "Uang muka", tone: "neutral" },
};

function shareDetail(line: RevenueShareLine): string {
  const parts = [`${formatKg(line.kg)} × ${formatRupiah(line.pricePerKg)}`];
  if (line.appliedDeduction > 0) {
    parts.push(`− cicilan ${formatRupiah(line.appliedDeduction)}`);
  }
  const detail = parts.join(" ");
  return line.pendingDeduction > 0 ? `${detail} · cicilan ${formatRupiah(line.pendingDeduction)} menunggu persetujuan` : detail;
}

function payoutSummaryText(payout: BatchPayout, fisherName: (id: string) => string, kubName: string): string {
  const { view, share } = payout;
  const day = view.receipt ? formatShortDayDate(view.receipt.receivedAt) : "";
  return [
    `*Bagi hasil · ${kubName}*`,
    `${view.species.name} ${view.batchGrade ?? view.order.minimumGrade}, ${formatKg(share.totalKg)} untuk ${view.buyer.name} (${day})`,
    ...share.lines.map((line) => `Pak ${fisherName(line.fisherId)}: ${formatRupiah(line.net)} (${shareDetail(line)})`),
    `Kode kiriman: ${view.batch.code}`,
  ].join("\n");
}

export function BatchPayoutCard({ payout, fishers, kubName }: { payout: BatchPayout; fishers: Fisher[]; kubName: string }) {
  const { view, share } = payout;
  const fisherOf = (id: string) => fishers.find((fisher) => fisher.id === id);
  const fisherName = (id: string) => fisherOf(id)?.name ?? "nelayan";
  const payment = view.payment;
  const pill = payment ? PAYMENT_PILL[payment.status] : null;
  return (
    <Card className="flex flex-col gap-3 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <GradeStamp grade={view.batchGrade ?? view.order.minimumGrade} size="sm" />
        <div className="flex min-w-0 flex-1 flex-col">
          <Link href={`/kub/batch/${view.batch.id}`} className="type-h3 hover:underline hover:underline-offset-4">
            {view.species.name} {view.batchGrade ?? view.order.minimumGrade} · {formatKg(share.totalKg)}
          </Link>
          <p className="text-ink-2">
            {view.buyer.name} membayar {formatRupiah(payment?.amount ?? 0)}
            {payment?.paidAt ? ` · ${formatShortDayDate(payment.paidAt)}` : ""}
          </p>
        </div>
        {pill && <Pill tone={pill.tone}>{pill.label}</Pill>}
      </div>
      <ul className="flex flex-col">
        {share.lines.map((line) => {
          const fisher = fisherOf(line.fisherId);
          return (
            <li key={line.fisherId} className="flex items-center gap-3 border-t border-line py-2.5">
              <Avatar initials={fisher?.initials ?? "?"} size="sm" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold">Pak {fisherName(line.fisherId)}</span>
                <span className="text-[0.9375rem] leading-snug text-ink-2">{shareDetail(line)}</span>
              </div>
              <span className="tabular shrink-0 text-lg font-semibold sm:type-num-m">{formatRupiah(line.net)}</span>
            </li>
          );
        })}
      </ul>
      {share.lines.some((line) => line.fisherId === DEMO_FISHER_ID) && (
        <RoleHandoff href={`/nelayan/uang/${view.batch.id}`} icon="boat">Lihat di HP nelayan · Pak Darman</RoleHandoff>
      )}
      <a
        href={`https://wa.me/?text=${encodeURIComponent(payoutSummaryText(payout, fisherName, kubName))}`}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClasses({ variant: "quiet", size: "md", block: true })}
      >
        <Icon name="chat" size={20} />
        Kirim ringkasan ke {share.lines.length} nelayan
      </a>
    </Card>
  );
}
