import { afterEach, beforeEach, expect, it, vi } from "vitest";

const writeSalesCopy = vi.fn();
vi.mock("@/server/sales-copy-model", () => ({ SALES_COPY_MODEL: "claude-haiku-5-5", writeSalesCopy }));

const body = {
  name: "Abon Tongkol",
  brand: "",
  grams: 100,
  price: 25000,
  ingredients: ["ikan tongkol"],
  origin: null,
  ownerNote: "",
};

function post(payload: unknown, ip = "10.0.0.1") {
  return new Request("http://localhost/api/studio/teks", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(payload),
  });
}

beforeEach(() => {
  vi.resetModules();
  writeSalesCopy.mockReset();
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
});
afterEach(() => vi.unstubAllEnvs());

it("answers 503 without calling the model when no key is configured", async () => {
  vi.stubEnv("ANTHROPIC_API_KEY", "");
  const { POST } = await import("./route");
  expect((await POST(post(body))).status).toBe(503);
  expect(writeSalesCopy).not.toHaveBeenCalled();
});

it("rejects malformed input before it reaches the model", async () => {
  const { POST } = await import("./route");
  expect((await POST(post({ ...body, price: -1 }))).status).toBe(400);
  expect(writeSalesCopy).not.toHaveBeenCalled();
});

it("returns checked captions and limits each visitor to ten requests an hour", async () => {
  const captions = { whatsappStatus: "a", marketplace: "b", instagram: "c" };
  writeSalesCopy.mockResolvedValue({ ok: true, captions });
  const { POST } = await import("./route");
  const first = await POST(post(body));
  expect(first.status).toBe(200);
  expect(await first.json()).toEqual({ captions, model: "claude-haiku-5-5" });
  for (let i = 1; i < 10; i += 1) await POST(post(body));
  expect((await POST(post(body))).status).toBe(429);
  expect((await POST(post(body, "10.0.0.2"))).status).toBe(200);
  expect(writeSalesCopy).toHaveBeenCalledTimes(11);
});

it("reports copy that failed the checks as 422", async () => {
  writeSalesCopy.mockResolvedValue({ ok: false, reason: "rejected", problems: ["unsupported_fact"] });
  const { POST } = await import("./route");
  const response = await POST(post(body));
  expect(response.status).toBe(422);
  expect(await response.json()).toEqual({ error: "rejected" });
});
