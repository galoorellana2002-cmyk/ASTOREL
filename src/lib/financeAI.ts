import { summaryForAI, type Summary } from "./finance";

const SYSTEM = [
  "Eres el asistente financiero del administrador de un patio de autos en Ecuador. Respondes en español, claro y directo.",
  "Trabajas SOLO con las cifras del bloque DATOS. Si algo no está en los datos, dilo y explica qué registro falta. Nunca inventes montos, fechas ni impuestos.",
  "Cuando hagas cuentas, muéstralas brevemente. Distingue flujo de caja (ingresos - gastos) de utilidad real (utilidad de autos vendidos - gastos generales): el dinero invertido en autos sin vender no es pérdida.",
  "Puedes sugerir dónde recortar gastos o qué revisar. No eres contador ni asesor financiero con licencia: para impuestos (SRI, IVA, renta) o decisiones de inversión recomienda consultar a un contador.",
  "Máximo 150 palabras salvo que pidan más detalle.",
].join("\n");

/** Respuesta de la IA con las cifras reales como contexto. Devuelve null si no hay clave o falla. */
export async function financeAnswer(question: string, s: Summary, period: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.FINANCE_MODEL || process.env.CHAT_MODEL || "claude-sonnet-5-5",
        max_tokens: 700,
        system: `${SYSTEM}\n\nDATOS:\n${summaryForAI(s, period)}`,
        messages: [{ role: "user", content: question }],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    return data.content?.find((c) => c.type === "text")?.text?.trim() || null;
  } catch {
    return null;
  }
}

/** Sin clave de IA: devuelve el análisis calculado por reglas. */
export function fallbackAnswer(s: Summary): string {
  return `${s.insights.map((i) => `• ${i}`).join("\n")}\n\n(Análisis automático. Define ANTHROPIC_API_KEY en .env para poder hacerle preguntas libres a la IA.)`;
}
