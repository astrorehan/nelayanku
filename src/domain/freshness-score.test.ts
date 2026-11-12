import { describe, expect, it } from "vitest";
import {
  assessFreshness,
  eyeScore,
  finalScore,
  gillScore,
  gradeFromParameters,
} from "./freshness-score";

describe("eyeScore", () => {
  it("maps a certain very-fresh eye to 9", () => {
    expect(eyeScore({ veryFresh: 1, fresh: 0, notFresh: 0 })).toBe(9);
  });

  it("weights probabilities 9 / 7 / 5 as in PRD §10.2", () => {
    expect(eyeScore({ veryFresh: 0.8, fresh: 0.2, notFresh: 0 })).toBe(8.6);
    expect(eyeScore({ veryFresh: 0, fresh: 0.5, notFresh: 0.5 })).toBe(6);
  });

  it("normalizes probabilities that do not sum to one", () => {
    expect(eyeScore({ veryFresh: 2, fresh: 0, notFresh: 0 })).toBe(9);
  });

  it("rejects negative probabilities", () => {
    expect(() => eyeScore({ veryFresh: -1, fresh: 1, notFresh: 1 })).toThrow();
  });
});

describe("gillScore", () => {
  it("maps fresh probability onto the 5 to 9 range", () => {
    expect(gillScore({ fresh: 1, notFresh: 0 })).toBe(9);
    expect(gillScore({ fresh: 0, notFresh: 1 })).toBe(5);
    expect(gillScore({ fresh: 0.775, notFresh: 0.225 })).toBe(8.1);
  });
});

describe("finalScore", () => {
  it("averages the four assessed parameters to one decimal", () => {
    expect(finalScore({ eye: 8.6, gill: 8.1, odor: 9, texture: 7 })).toBe(8.2);
  });
});

describe("gradeFromParameters", () => {
  it("gives A when the average is at least 8 and no parameter is under 7", () => {
    expect(gradeFromParameters({ eye: 8.6, gill: 8.1, odor: 9, texture: 9 }, "sea_fresh")).toBe("A");
  });

  it("downgrades to B when one parameter is under 7 even if the average reaches 8", () => {
    expect(gradeFromParameters({ eye: 9, gill: 9, odor: 9, texture: 5 }, "sea_fresh")).toBe("B");
  });

  it("gives B from the SNI minimum of 7", () => {
    expect(gradeFromParameters({ eye: 7, gill: 7, odor: 7, texture: 7 }, "neutral")).toBe("B");
  });

  it("gives C between 5 and 7", () => {
    expect(gradeFromParameters({ eye: 6, gill: 6, odor: 5, texture: 7 }, "sour")).toBe("C");
  });

  it("rejects anything under 5", () => {
    expect(gradeFromParameters({ eye: 5, gill: 5, odor: 5, texture: 3 }, "sour")).toBe("REJECT");
  });

  it("rejects rotten odor regardless of the other scores", () => {
    expect(gradeFromParameters({ eye: 9, gill: 9, odor: 1, texture: 9 }, "rotten")).toBe("REJECT");
  });
});

describe("assessFreshness", () => {
  it("reproduces the PRD example of a prime tongkol", () => {
    const assessment = assessFreshness({
      eye: { veryFresh: 0.8, fresh: 0.2, notFresh: 0 },
      gill: { fresh: 0.775, notFresh: 0.225 },
      odor: "sea_fresh",
      texture: "slightly_soft",
    });
    expect(assessment.parameters).toEqual({ eye: 8.6, gill: 8.1, odor: 9, texture: 7 });
    expect(assessment.finalScore).toBe(8.2);
    expect(assessment.grade).toBe("A");
  });
});
