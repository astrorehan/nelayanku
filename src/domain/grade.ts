export const GRADES = ["A", "B", "C", "REJECT"] as const;

export type Grade = (typeof GRADES)[number];

export type SellableGrade = Exclude<Grade, "REJECT">;

const GRADE_RANK: Record<Grade, number> = { A: 3, B: 2, C: 1, REJECT: 0 };

export function isGradeAtLeast(grade: Grade, minimum: Grade): boolean {
  return GRADE_RANK[grade] >= GRADE_RANK[minimum];
}

export function lowestGrade(grades: readonly Grade[]): Grade {
  if (grades.length === 0) {
    throw new Error("lowestGrade needs at least one grade");
  }
  return grades.reduce((lowest, grade) => (GRADE_RANK[grade] < GRADE_RANK[lowest] ? grade : lowest));
}

export function isSellableGrade(grade: Grade): grade is SellableGrade {
  return grade !== "REJECT";
}
