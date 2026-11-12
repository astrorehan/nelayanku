import { describe, expect, it } from "vitest";
import { splitRevenue } from "./revenue-share";

describe("splitRevenue", () => {
  const contributions = [
    { fisherId: "darman", kg: 18 },
    { fisherId: "joni", kg: 14 },
    { fisherId: "herman", kg: 8 },
  ];

  it("pays each fisher kg × price", () => {
    const share = splitRevenue({ contributions, fisherPricePerKg: 16300 });
    expect(share.lines.map((line) => line.gross)).toEqual([293400, 228200, 130400]);
    expect(share.totalKg).toBe(40);
    expect(share.totalNet).toBe(652000);
  });

  it("applies only deductions the fisher approved", () => {
    const share = splitRevenue({
      contributions,
      fisherPricePerKg: 16300,
      deductions: [
        { fisherId: "darman", amount: 50000, status: "approved_by_link" },
        { fisherId: "herman", amount: 30000, status: "pending" },
        { fisherId: "joni", amount: 20000, status: "declined" },
      ],
    });
    const [darman, joni, herman] = share.lines;
    expect(darman.net).toBe(243400);
    expect(joni.net).toBe(228200);
    expect(herman.appliedDeduction).toBe(0);
    expect(herman.pendingDeduction).toBe(30000);
    expect(share.totalDeductions).toBe(50000);
  });

  it("counts verbal approval recorded by the operator", () => {
    const share = splitRevenue({
      contributions: [{ fisherId: "darman", kg: 10 }],
      fisherPricePerKg: 10000,
      deductions: [{ fisherId: "darman", amount: 25000, status: "approved_verbally" }],
    });
    expect(share.lines[0].net).toBe(75000);
  });

  it("never deducts more than the fisher earned", () => {
    const share = splitRevenue({
      contributions: [{ fisherId: "darman", kg: 1 }],
      fisherPricePerKg: 10000,
      deductions: [{ fisherId: "darman", amount: 50000, status: "approved_by_link" }],
    });
    expect(share.lines[0].net).toBe(0);
    expect(share.lines[0].appliedDeduction).toBe(10000);
  });

  it("merges several landings from the same fisher", () => {
    const share = splitRevenue({
      contributions: [
        { fisherId: "darman", kg: 5 },
        { fisherId: "darman", kg: 3 },
      ],
      fisherPricePerKg: 10000,
    });
    expect(share.lines).toHaveLength(1);
    expect(share.lines[0].kg).toBe(8);
  });
});
