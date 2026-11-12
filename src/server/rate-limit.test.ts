import { expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

it("allows up to the limit per key and resets after the window", () => {
  const allow = createRateLimiter({ limit: 2, windowMs: 1000 });
  expect([allow("a", 0), allow("a", 10), allow("a", 20)]).toEqual([true, true, false]);
  expect(allow("b", 20)).toBe(true);
  expect(allow("a", 1000)).toBe(true);
});

it("refuses new keys once the table is full of live windows", () => {
  const allow = createRateLimiter({ limit: 1, windowMs: 1000, maxKeys: 2 });
  expect([allow("a", 0), allow("b", 0), allow("c", 0)]).toEqual([true, true, false]);
  expect(allow("c", 1000)).toBe(true);
});
