import { describe, expect, it } from "vitest";
import { isGradeAtLeast, isSellableGrade, lowestGrade } from "./grade";

describe("isGradeAtLeast", () => {
  it("accepts equal and higher grades", () => {
    expect(isGradeAtLeast("A", "B")).toBe(true);
    expect(isGradeAtLeast("B", "B")).toBe(true);
  });

  it("refuses lower grades", () => {
    expect(isGradeAtLeast("C", "B")).toBe(false);
    expect(isGradeAtLeast("REJECT", "C")).toBe(false);
  });
});

describe("lowestGrade", () => {
  it("picks the most conservative grade from basket samples", () => {
    expect(lowestGrade(["A", "B", "A"])).toBe("B");
    expect(lowestGrade(["A", "REJECT"])).toBe("REJECT");
  });

  it("throws on an empty basket", () => {
    expect(() => lowestGrade([])).toThrow();
  });
});

describe("isSellableGrade", () => {
  it("treats only REJECT as unsellable", () => {
    expect(isSellableGrade("C")).toBe(true);
    expect(isSellableGrade("REJECT")).toBe(false);
  });
});
