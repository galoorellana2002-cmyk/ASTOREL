"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface Msg {
  role: "user" | "bot";
  text: string;
}

const STORE = "patio_chat";
const GREETING: Msg = { role: "bot", text: "¡Hola! Soy el asistente del patio. Te ayudo a encontrar un auto, ver su estado y su ficha legal. ¿Qué buscas?" };
const START_SUGGESTIONS = ["Ver autos disponibles", "Busco una camioneta", "Tengo un presupuesto"];

function readCount(key: string): number {
  try {
    return Number(localStorage.getItem(key)) || 0;
  } catch {
    return 0;
  }
}

function viewedCount(): number {
  try {
    const raw = JSON.parse(localStorage.getItem("patio_viewed") || "[]") as unknown;
    return Array.isArray(raw) ? raw.length : 0;
  } catch {
    return 0;
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [sugg, setSugg] = useState<string[]>(START_SUGGESTIONS);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionId = useRef<string | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || "null") as { sessionId?: string; msgs?: Msg[] } | null;
      if (saved?.sessionId) sessionId.current = saved.sessionId;
      if (saved?.msgs?.length) {
        setMsgs(saved.msgs);
        setSugg([]);
      }
    } catch {
      /* sin almacenamiento */
    }
  }, []);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [msgs, busy, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  function persist(next: Msg[]) {
    try {
      localStorage.setItem(STORE, JSON.stringify({ sessionId: sessionId.current, msgs: next.slice(-40) }));
    } catch {
      /* sin almacenamiento */
    }
  }

  async function send(text: string) {
    const message = text.trim();
    if (!message || busy) return;
    const withUser: Msg[] = [...msgs, { role: "user", text: message }];
    setMsgs(withUser);
    setInput("");
    setSugg([]);
    setBusy(true);
    const slug = pathname.startsWith("/autos/") ? pathname.split("/")[2] : undefined;
    let next = withUser;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sessionId: sessionId.current ?? undefined, message, currentSlug: slug, viewed: viewedCount(), viewerOpens: readCount("patio_viewer_opens") }),
      });
      const data = (await res.json()) as { sessionId?: string; reply?: string; suggestions?: string[]; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error || "No pude responder.");
      sessionId.current = data.sessionId ?? sessionId.current;
      next = [...withUser, { role: "bot", text: data.reply }];
      setSugg(data.suggestions ?? []);
    } catch (e) {
      next = [...withUser, { role: "bot", text: e instanceof Error ? e.message : "Ocurrió un error. Intenta de nuevo." }];
    } finally {
      setMsgs(next);
      persist(next);
      setBusy(false);
    }
  }

  return (
    <>
      {!open && (
        <button type="button" className="chat-fab" onClick={() => setOpen(true)} aria-label="Abrir el chat">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z" />
          </svg>
          Chatea con nosotros
        </button>
      )}
      <section className="chat-panel" hidden={!open} aria-label="Chat con el patio">
        <div className="chat-head">
          <div>
            <b>Asistente del patio</b>
            <small>Respuestas al instante</small>
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar el chat">
            ×
          </button>
        </div>
        <div className="chat-log" ref={log} role="log" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`msg ${m.role}`}>
              {m.text}
            </div>
          ))}
          {busy && <div className="typing">Escribiendo…</div>}
        </div>
        {sugg.length > 0 && (
          <div className="chat-sugg">
            {sugg.map((s) => (
              <button key={s} type="button" onClick={() => void send(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          className="chat-form"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={500} placeholder="Escribe tu mensaje" aria-label="Tu mensaje" />
          <button type="submit" disabled={busy || !input.trim()}>
            Enviar
          </button>
        </form>
      </section>
    </>
  );
}
