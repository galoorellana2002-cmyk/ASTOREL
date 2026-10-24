"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        {IDEAS.map((i) => (
          <Button key={i} type="button" size="sm" variant="outline" className="h-auto min-h-9 whitespace-normal py-1.5 text-left" onClick={() => ask(i)} disabled={busy}>
            {i}
          </Button>
        ))}
      </div>
      <div aria-live="polite" className="mb-3 flex flex-col gap-3.5">
        <AnimatePresence initial={false}>
          {log.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <p className="mb-1 text-[15px]">{m.q}</p>
              <p className="whitespace-pre-wrap rounded-xl border border-hair bg-alt px-3.5 py-3 text-[15px] leading-relaxed">{m.a}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {busy && (
          <p className="flex items-center gap-2 text-[13px] text-mut">
            <Sparkles className="size-4 animate-pulse" aria-hidden="true" />
            Analizando tus cifras…
          </p>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void ask(q);
        }}
        className="flex flex-wrap gap-2"
      >
        <Input className="flex-[1_1_240px]" value={q} onChange={(e) => setQ(e.target.value)} maxLength={600} placeholder="Pregunta sobre tus gastos, ganancias o pérdidas…" aria-label="Pregunta al asistente financiero" />
        <Button size="sm" className="h-11" type="submit" disabled={busy || !q.trim()}>Preguntar</Button>
      </form>
      <p className="mt-2 text-[13px] text-mut">Es un asistente de gestión: usa solo tus movimientos registrados y no reemplaza a un contador (impuestos, SRI).</p>
    </div>
  );
}
