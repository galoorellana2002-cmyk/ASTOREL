import "server-only";
import { db } from "./db";

// Límite compartido en la base (funciona en Vercel, donde cada petición puede caer
// en un servidor distinto). Si la base falla, cae a un límite en memoria.
const hits = new Map<string, number[]>();

function memoryLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.every((t) => now - t >= windowMs)) hits.delete(k);
  }
  return true;
}

/** true = permitido, false = se pasó del límite. */
export async function rateLimit(key: string, max: number, windowMs: number): Promise<boolean> {
  try {
    const rows = await db.$queryRaw<{ count: number }[]>`
      INSERT INTO "RateLimit" ("key", "count", "resetAt")
      VALUES (${key}, 1, now() + (${windowMs}::double precision * interval '1 millisecond'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimit"."resetAt" < now() THEN 1 ELSE "RateLimit"."count" + 1 END,
        "resetAt" = CASE WHEN "RateLimit"."resetAt" < now() THEN EXCLUDED."resetAt" ELSE "RateLimit"."resetAt" END
      RETURNING "count"`;
    if (Math.random() < 0.02) void db.$executeRaw`DELETE FROM "RateLimit" WHERE "resetAt" < now() - interval '1 day'`.catch(() => undefined);
    return (rows[0]?.count ?? 1) <= max;
  } catch {
    return memoryLimit(key, max, windowMs);
  }
}

/** IP del visitante. En Vercel, x-real-ip y x-vercel-forwarded-for los pone la plataforma. */
export function clientIp(h: Headers): string {
  return h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip")?.trim() || h.get("x-forwarded-for")?.split(",").pop()?.trim() || "local";
}
