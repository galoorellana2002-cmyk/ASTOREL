import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";
import { getBotInventory } from "@/lib/vehicles";
import { llmReply, respond } from "@/lib/bot";
import { refreshLead } from "@/lib/leads";
import { PATIO_NAME } from "@/lib/format";

export const dynamic = "force-dynamic";

const MAX_MESSAGES_PER_SESSION = 200;

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`chat:${ip}`, 20, 60_000)) {
    return NextResponse.json({ error: "Demasiados mensajes. Espera un momento." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }
  const parsed = chatSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Mensaje inválido." }, { status: 400 });
  const { message, currentSlug, viewed, viewerOpens } = parsed.data;

  // Sesión existente o nueva (un cliente anónimo = un Lead con su conversación).
  let session = parsed.data.sessionId
    ? await db.chatSession.findUnique({ where: { id: parsed.data.sessionId }, include: { lead: true, _count: { select: { messages: true } } } })
    : null;
  if (session && session._count.messages >= MAX_MESSAGES_PER_SESSION) {
    return NextResponse.json({ error: "Esta conversación llegó al límite. Escríbenos por WhatsApp." }, { status: 429 });
  }
  if (!session) {
    const lead = await db.lead.create({ data: { source: "CHAT" } });
    session = await db.chatSession.create({ data: { leadId: lead.id }, include: { lead: true, _count: { select: { messages: true } } } });
  }

  await db.chatMessage.create({ data: { sessionId: session.id, role: "user", content: message } });

  const vehicles = await getBotInventory();
  const ctx = {
    vehicles,
    patioName: PATIO_NAME,
    currentSlug: currentSlug ?? null,
    known: { name: session.lead.name, phone: session.lead.phone, email: session.lead.email },
  };
  const result = respond(message, ctx);

  // Si hay clave de Claude, redacta la respuesta; las reglas siguen extrayendo datos y sugerencias.
  let reply = result.reply;
  if (process.env.ANTHROPIC_API_KEY && !result.extracted.phone && !result.extracted.email) {
    const past = await db.chatMessage.findMany({ where: { sessionId: session.id }, orderBy: { createdAt: "asc" }, take: 30 });
    const history = past.map((m) => ({ role: m.role === "user" ? ("user" as const) : ("assistant" as const), content: m.content }));
    const llm = await llmReply(history, ctx);
    if (llm) reply = llm;
  }

  const { name, phone, email, vehicleId } = result.extracted;
  await db.lead.update({
    where: { id: session.leadId },
    data: {
      ...(name && !session.lead.name ? { name } : {}),
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      ...(vehicleId ? { vehicleId } : {}),
      vehiclesViewed: Math.max(session.lead.vehiclesViewed, viewed ?? 0),
      viewerOpens: Math.max(session.lead.viewerOpens, viewerOpens ?? 0),
    },
  });
  await db.chatMessage.create({ data: { sessionId: session.id, role: "bot", content: reply } });
  await refreshLead(session.leadId);

  return NextResponse.json({ sessionId: session.id, reply, suggestions: result.suggestions });
}
