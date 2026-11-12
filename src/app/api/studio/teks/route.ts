import Anthropic from "@anthropic-ai/sdk";
import { parseSalesCopyInput } from "@/domain/sales-copy";
import { createRateLimiter } from "@/server/rate-limit";
import { SALES_COPY_MODEL, writeSalesCopy } from "@/server/sales-copy-model";

export const runtime = "nodejs";

const HOUR = 60 * 60 * 1000;
const perVisitor = createRateLimiter({ limit: 10, windowMs: HOUR });
const perInstance = createRateLimiter({ limit: 300, windowMs: 24 * HOUR });

function visitorKey(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function fail(status: number, error: string) {
  return Response.json({ error }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) return fail(503, "unavailable");
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "invalid_input");
  }
  const input = parseSalesCopyInput(body);
  if (!input) return fail(400, "invalid_input");
  if (!perVisitor(visitorKey(request)) || !perInstance("all")) return fail(429, "rate_limited");

  try {
    const result = await writeSalesCopy(new Anthropic(), input);
    if (!result.ok) return fail(422, result.reason);
    return Response.json(
      { captions: result.captions, model: SALES_COPY_MODEL },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) return fail(429, "rate_limited");
    console.error("Sales copy request failed", error instanceof Anthropic.APIError ? error.status : error);
    return fail(502, "upstream_failed");
  }
}
