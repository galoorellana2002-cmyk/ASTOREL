"use client";

import { useState } from "react";

const IDEAS = ["¿Estoy ganando o perdiendo dinero?", "¿Dónde puedo recortar gastos?", "¿Qué auto me dejó más utilidad?", "Explícame la diferencia entre flujo de caja y utilidad"];

export function FinanceAssistant({ period }: { period: string }) {
  const [q, setQ] = useState("");
  const [log, setLog] = useState<Array<{ q: string; a: string }>>([]);
  const [busy, setBusy] = useState(false);

  async function ask(question: string) {
    if (!question.trim() || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/finance-ai", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, period }) });
      const data = (await res.json()) as { answer?: string; error?: string };
      setLog((l) => [...l, { q: question, a: data.answer ?? data.error ?? "No pude responder." }]);
      setQ("");
    } catch {
      setLog((l) => [...l, { q: question, a: "No hubo conexión con el servidor." }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fin-ai">
      <div className="chips-row">
        {IDEAS.map((i) => <button key={i} type="button" className="btn sm out" onClick={() => ask(i)} disabled={busy}>{i}</button>)}
      </div>
      <div className="fin-log" aria-live="polite">
        {log.map((m, i) => (
          <div key={i}>
            <p className="fin-q">{m.q}</p>
            <p className="fin-a">{m.a}</p>
          </div>
        ))}
        {busy && <p className="small">Analizando tus cifras…</p>}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); void ask(q); }} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <input className="field" style={{ flex: "1 1 240px" }} value={q} onChange={(e) => setQ(e.target.value)} maxLength={600} placeholder="Pregunta sobre tus gastos, ganancias o pérdidas…" aria-label="Pregunta al asistente financiero" />
        <button className="btn sm" type="submit" disabled={busy || !q.trim()}>Preguntar</button>
      </form>
      <p className="small" style={{ marginTop: 8 }}>Es un asistente de gestión: usa solo tus movimientos registrados y no reemplaza a un contador (impuestos, SRI).</p>
    </div>
  );
}
