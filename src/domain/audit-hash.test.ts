import { describe, expect, it } from "vitest";
import { auditHash, canonicalJson, sha256Hex, shortHash } from "./audit-hash";

describe("canonicalJson", () => {
  it("sorts keys so the same record always hashes the same", () => {
    expect(canonicalJson({ b: 1, a: { d: [2, 1], c: null } })).toBe('{"a":{"c":null,"d":[2,1]},"b":1}');
  });
});

describe("sha256Hex", () => {
  it("matches the known digest of an empty string", async () => {
    expect(await sha256Hex("")).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
  });
});

describe("auditHash", () => {
  it("ignores key order but not values", async () => {
    const first = await auditHash({ grade: "A", score: 8.4 });
    expect(await auditHash({ score: 8.4, grade: "A" })).toBe(first);
    expect(await auditHash({ score: 8.3, grade: "A" })).not.toBe(first);
  });
});

describe("shortHash", () => {
  it("keeps the head and tail readable", () => {
    expect(shortHash("9f2c81ab00000000000000000000000000000000000000000000000000004e1a")).toBe("9f2c 81ab … 4e1a");
  });
});
