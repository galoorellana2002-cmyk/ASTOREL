/** Cabeceras para la API de Anthropic. Si tu clave es personal (sk-ant-usr-...), define ANTHROPIC_WORKSPACE_ID. */
export function anthropicHeaders(key: string): Record<string, string> {
  const h: Record<string, string> = { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" };
  const ws = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
  if (ws) h["anthropic-workspace-id"] = ws;
  return h;
}

/** Une todos los bloques de texto de la respuesta y quita el formato markdown (la interfaz muestra texto plano). */
export function extractText(data: { content?: Array<{ type: string; text?: string }>; stop_reason?: string }): string {
  const raw = (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
  return raw
    .replace(/\*\*(.+?)\*\*/gs, "$1")
    .replace(/__(.+?)__/gs, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*]\s+/gm, "• ")
    .trim();
}
