export const DEDUCTION_STATUSES = ["pending", "approved_by_link", "approved_verbally", "declined"] as const;
export type DeductionStatus = (typeof DEDUCTION_STATUSES)[number];

export interface Contribution {
  fisherId: string;
  kg: number;
}

export interface DebtDeduction {
  fisherId: string;
  amount: number;
  status: DeductionStatus;
}

export interface RevenueShareLine {
  fisherId: string;
  kg: number;
  pricePerKg: number;
  gross: number;
  appliedDeduction: number;
  pendingDeduction: number;
  net: number;
}

export interface RevenueShare {
  lines: RevenueShareLine[];
  totalKg: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
}

export function isApprovedDeduction(status: DeductionStatus): boolean {
  return status === "approved_by_link" || status === "approved_verbally";
}

function sumAmounts(deductions: readonly DebtDeduction[], keep: (status: DeductionStatus) => boolean): number {
  return deductions.filter((deduction) => keep(deduction.status)).reduce((sum, deduction) => sum + deduction.amount, 0);
}

export function splitRevenue(params: {
  contributions: readonly Contribution[];
  fisherPricePerKg: number;
  deductions?: readonly DebtDeduction[];
}): RevenueShare {
  const { contributions, fisherPricePerKg, deductions = [] } = params;
  const kgByFisher = new Map<string, number>();
  for (const { fisherId, kg } of contributions) {
    kgByFisher.set(fisherId, (kgByFisher.get(fisherId) ?? 0) + kg);
  }

  const lines = [...kgByFisher].map(([fisherId, kg]): RevenueShareLine => {
    const gross = Math.round(kg * fisherPricePerKg);
    const own = deductions.filter((deduction) => deduction.fisherId === fisherId);
    const appliedDeduction = Math.min(gross, sumAmounts(own, isApprovedDeduction));
    return {
      fisherId,
      kg,
      pricePerKg: fisherPricePerKg,
      gross,
      appliedDeduction,
      pendingDeduction: sumAmounts(own, (status) => status === "pending"),
      net: gross - appliedDeduction,
    };
  });

  return {
    lines,
    totalKg: lines.reduce((sum, line) => sum + line.kg, 0),
    totalGross: lines.reduce((sum, line) => sum + line.gross, 0),
    totalDeductions: lines.reduce((sum, line) => sum + line.appliedDeduction, 0),
    totalNet: lines.reduce((sum, line) => sum + line.net, 0),
  };
}
