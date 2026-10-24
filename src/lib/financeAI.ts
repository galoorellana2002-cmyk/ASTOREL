import { anthropicHeaders, extractText } from "./anthropicHeaders";
import { summaryForAI, type Summary } from "./finance";

const SYSTEM = [
  "Eres el asistente financiero del administrador de un patio de autos en Ecuador. Respondes en español, claro y directo.",
  "Trabajas SOLO con las cifras del bloque DATOS. Si algo no está en los datos, dilo y explica qué registro falta. Nunca inventes montos, fechas ni impuestos.",
  "Cuando hagas cuentas, muéstralas brevemente. Distingue flujo de caja (ingresos - gastos) de utilidad real (utilidad de autos vendidos - gastos generales): el dinero invertido en autos sin vender no es pérdida.",
  "Puedes sugerir dónde recortar gastos o qué revisar. No eres contador ni asesor financiero con licencia: para impuestos (SRI, IVA, renta) o decisiones de inversión recomienda consultar a un contador.",
  "Máximo 150 palabras salvo que pidan más detalle.",
  "Escribe en texto plano: sin markdown, sin asteriscos ni almohadillas. Para listas usa líneas que empiecen con •.",
].join("\n");

/** Respuesta de la IA con las cifras reales como contexto. Devuelve null si no hay clave o falla. */
export async function financeAnswer(question: string, s: Summary, period: string): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    console.error("[finanzas-ia] Falta ANTHROPIC_API_KEY en el entorno.");
    return null;
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: anthropicHeaders(key),
      body: JSON.stringify({
        model: process.env.FINANCE_MODEL || process.env.CHAT_MODEL || "claude-sonnet-5-5",
        max_tokens: 2000,
        system: `${SYSTEM}\n\nDATOS:\n${summaryForAI(s, period)}`,
        messages: [{ role: "user", content: question }],
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error(`[finanzas-ia] Anthropic respondió ${res.status}: ${detail}`);
      return null;
    }
    const data = (await res.json()) as {
      content?: Array<{ type: string; text?: string }>;
      stop_reason?: string;
      usage?: { output_tokens?: number };
    };
    const text = extractText(data);
    console.warn(
      `[finanzas-ia] stop=${data.stop_reason ?? "?"} bloques=${(data.content ?? []).map((c) => c.type).join(",") || "ninguno"} tokens_salida=${data.usage?.output_tokens ?? "?"} caracteres=${text.length}`,
    );
    if (!text) return null;
    return data.stop_reason === "max_tokens" ? `${text}\n\n(Respuesta recortada: pide "más detalle" para continuar.)` : text;
  } catch (e) {
    console.error("[finanzas-ia] Falló la llamada a Anthropic:", e instanceof Error ? e.message : e);
    return null;
  }
}

/** Sin clave de IA: devuelve el análisis calculado por reglas. */
export function fallbackAnswer(s: Summary): string {
  return `${s.insights.map((i) => `• ${i}`).join("\n")}\n\n(Análisis automático por reglas: la IA no respondió en este momento. Revisa ANTHROPIC_API_KEY, el saldo de tu cuenta de Anthropic y los registros del servidor.)`;
}
