import { describe, expect, it } from "vitest";
import { DEMO_START } from "../demo-clock";
import { createSeedDatabase } from "../seed";
import {
  allBatchViews,
  attentionItems,
  countByFilter,
  groupOrdersByDay,
  landingDetail,
  matchesMemberSearch,
  memberProfile,
  memberSummaries,
  orderFilterOf,
} from "./operator-pages";

const db = createSeedDatabase();

describe("operator order list", () => {
  const views = allBatchViews(db, DEMO_START);

  it("covers every batch, not only today's", () => {
    expect(views).toHaveLength(db.batches.length);
    expect(views.length).toBeGreaterThan(3);
  });

  it("sorts every batch into exactly one filter", () => {
    const counts = countByFilter(views);
    expect(Object.values(counts).reduce((a, b) => a + b, 0)).toBe(views.length);
    expect(counts.aktif).toBeGreaterThan(0);
    expect(counts.selesai).toBeGreaterThan(0);
  });

  it("groups by delivery day with the newest day first", () => {
    const days = groupOrdersByDay(views);
    const dates = days.map((day) => day.date);
    expect([...dates].sort().reverse()).toEqual(dates);
    expect(days.flatMap((day) => day.views)).toHaveLength(views.length);
  });

  it("marks in-transit batches as on the road", () => {
    const transit = views.find((view) => view.batch.status === "in_transit")!;
    expect(orderFilterOf(transit)).toBe("jalan");
  });

  it("reports the late payment from the seed as needing attention", () => {
    const items = attentionItems(db, DEMO_START);
    expect(items.filter((item) => item.kind === "late_payment")).toHaveLength(1);
  });
});

describe("operator members", () => {
  it("lists all fishers by member number", () => {
    const members = memberSummaries(db, DEMO_START);
    expect(members).toHaveLength(12);
    const numbers = members.map((member) => member.fisher.memberNumber);
    expect([...numbers].sort((a, b) => a - b)).toEqual(numbers);
  });

  it("searches by name or member number", () => {
    const [first] = memberSummaries(db, DEMO_START);
    expect(matchesMemberSearch(first, "Tongkol", first.fisher.name.slice(0, 3))).toBe(true);
    expect(matchesMemberSearch(first, "Tongkol", String(first.fisher.memberNumber))).toBe(true);
    expect(matchesMemberSearch(first, "Tongkol", "zzzz")).toBe(false);
    expect(matchesMemberSearch(first, "Tongkol", "")).toBe(true);
  });

  it("builds a profile whose grade shares add up to the graded landings", () => {
    const profile = memberProfile(db, "nelayan-darman", DEMO_START)!;
    const graded = profile.landings.filter((view) => view.grading).length;
    expect(profile.gradeShares.reduce((sum, share) => sum + share.count, 0)).toBe(graded);
    expect(profile.landings.length).toBeGreaterThan(0);
  });

  it("returns undefined for an unknown member", () => {
    expect(memberProfile(db, "nope", DEMO_START)).toBeUndefined();
  });
});

describe("landing detail", () => {
  it("shows freshness and grading for a graded landing", () => {
    const graded = db.gradings[0];
    const detail = landingDetail(db, graded.landingId, DEMO_START)!;
    expect(detail.view.grading?.auditHash).toBe(graded.auditHash);
    expect(detail.windowHours).toBeGreaterThan(0);
  });

  it("returns undefined for an unknown landing", () => {
    expect(landingDetail(db, "nope", DEMO_START)).toBeUndefined();
  });
});
