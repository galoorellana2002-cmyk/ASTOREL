import { db } from "./db";
import { classify } from "./leadScoring";

/** Recalcula el segmento del cliente con todo lo que sabemos. No pisa un segmento fijado a mano. */
export async function refreshLead(leadId: string) {
  const lead = await db.lead.findUnique({
    where: { id: leadId },
    include: {
      reservations: { select: { id: true } },
      sessions: { select: { messages: { where: { role: "user" }, orderBy: { createdAt: "asc" }, select: { content: true } } } },
    },
  });
  if (!lead) return null;
  const userMessages = lead.sessions.flatMap((s) => s.messages.map((m) => m.content));
  const result = classify({
    userMessages,
    hasPhone: Boolean(lead.phone),
    hasName: Boolean(lead.name),
    vehiclesViewed: lead.vehiclesViewed,
    viewerOpens: lead.viewerOpens,
    reserved: lead.reservations.length > 0,
  });
  return db.lead.update({
    where: { id: leadId },
    data: {
      score: result.score,
      reasons: JSON.stringify(result.reasons),
      ...(lead.segmentLocked ? {} : { segment: result.segment }),
    },
  });
}

export function parseReasons(raw: string): string[] {
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
