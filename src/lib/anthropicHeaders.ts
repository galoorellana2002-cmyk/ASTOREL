/** Cabeceras para la API de Anthropic. Si tu clave es personal (sk-ant-usr-...), define ANTHROPIC_WORKSPACE_ID. */
export function anthropicHeaders(key: string): Record<string, string> {
  const h: Record<string, string> = { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" };
  const ws = process.env.ANTHROPIC_WORKSPACE_ID?.trim();
  if (ws) h["anthropic-workspace-id"] = ws;
  return h;
}
