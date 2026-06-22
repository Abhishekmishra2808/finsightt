const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, max: number, windowMs: number): string | null {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (entry.count >= max) {
    return `Too many requests. Try again in ${Math.ceil((entry.resetAt - now) / 1000)} seconds.`;
  }

  entry.count += 1;
  return null;
}

export function getClientIp(
  headers: Record<string, string | string[] | undefined>,
  fallback = "unknown"
): string {
  const forwarded = headers["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  if (Array.isArray(forwarded) && forwarded[0]) return forwarded[0].split(",")[0].trim();
  return fallback;
}
