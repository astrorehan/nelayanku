import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { auditHash, canonicalJson, sha256Hex, shortHash } from "./audit-hash";

describe("canonicalJson", () => {
  it("sorts keys so the same record always hashes the same", () => {
    expect(canonicalJson({ b: 1, a: { d: [2, 1], c: null } })).toBe('{"a":{"c":null,"d":[2,1]},"b":1}');
  });
});

describe("sha256Hex", () => {
  it("matches the standard test vectors", () => {
    expect(sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
    expect(sha256Hex("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("agrees with the platform implementation across block boundaries and Unicode", () => {
    for (const text of ["a".repeat(55), "a".repeat(56), "a".repeat(64), "a".repeat(1000), "ikan segar · Rp20.000 ✓"]) {
      expect(sha256Hex(text)).toBe(createHash("sha256").update(text, "utf8").digest("hex"));
    }
  });
});

describe("auditHash", () => {
  it("ignores key order but not values", () => {
    const first = auditHash({ grade: "A", score: 8.4 });
    expect(auditHash({ score: 8.4, grade: "A" })).toBe(first);
    expect(auditHash({ score: 8.3, grade: "A" })).not.toBe(first);
  });
});

describe("shortHash", () => {
  it("keeps the head and tail readable", () => {
    expect(shortHash("9f2c81ab00000000000000000000000000000000000000000000000000004e1a")).toBe("9f2c 81ab … 4e1a");
  });
});
