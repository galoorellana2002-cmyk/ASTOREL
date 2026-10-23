import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";
import { loadFinance, parsePeriod, periodLabel } from "@/lib/financeData";
import { fallbackAnswer, financeAnswer } from "@/lib/financeAI";

export const dynamic = "force-dynamic";

const schema = z.object({ question: z.string().trim().min(1).max(600), period: z.string().default("todo") });

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  if (!rateLimit(`fin-ai:${admin.id}`, 20, 60_000)) return NextResponse.json({ error: "Demasiadas preguntas seguidas. Espera un momento." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Escribe una pregunta." }, { status: 400 });

  const period = parsePeriod(parsed.data.period);
  const { summary } = await loadFinance(period);
  const ai = await financeAnswer(parsed.data.question, summary, periodLabel(period));
  return NextResponse.json({ answer: ai ?? fallbackAnswer(summary), ai: Boolean(ai) });
}
