// Fixed-window limiter held in memory. On serverless hosting each warm instance keeps its own
// counts, so this only slows abuse; the hard spending cap is the workspace limit in the
// Anthropic Console.
export function createRateLimiter(options: { limit: number; windowMs: number; maxKeys?: number }) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const maxKeys = options.maxKeys ?? 5_000;
  return function allow(key: string, now = Date.now()): boolean {
    const entry = hits.get(key);
    if (!entry || entry.resetAt <= now) {
      if (hits.size >= maxKeys) {
        for (const [storedKey, stored] of hits) if (stored.resetAt <= now) hits.delete(storedKey);
        if (hits.size >= maxKeys) return false;
      }
      hits.set(key, { count: 1, resetAt: now + options.windowMs });
      return true;
    }
    if (entry.count >= options.limit) return false;
    entry.count += 1;
    return true;
  };
}
