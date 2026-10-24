"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

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
      <AnimatePresence>
        {!open && (
          <motion.button
            key="fab"
            type="button"
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.9 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(true)}
            aria-label="Abrir el chat"
            className="fixed bottom-[max(16px,env(safe-area-inset-bottom,0px))] right-[max(16px,env(safe-area-inset-right,0px))] z-40 inline-flex min-h-12 items-center gap-2.5 rounded-full bg-inv px-5 max-sm:size-12 max-sm:justify-center max-sm:px-0 text-[15px] text-inv-fg shadow-lift"
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            <span className="max-sm:sr-only">Chatea con nosotros</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.section
            key="panel"
            aria-label="Chat con el patio"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed bottom-[max(16px,env(safe-area-inset-bottom,0px))] right-[max(16px,env(safe-area-inset-right,0px))] z-[85] flex h-[min(580px,calc(100svh-96px))] w-[min(390px,calc(100vw-32px))] flex-col overflow-hidden rounded-3xl border border-hair bg-card shadow-lift"
          >
            <div className="flex items-center justify-between gap-3 bg-black px-[18px] py-3.5 text-white">
              <div className="flex flex-col leading-tight">
                <span>Asistente del patio</span>
                <small className="mt-0.5 flex items-center gap-1.5 text-xs text-white/60">
                  <i className="size-1.5 rounded-full bg-[#30d158]" aria-hidden="true" />
                  Respuestas al instante
                </small>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar el chat" className="grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline-white">
                <X className="size-5" />
              </button>
            </div>

            <div ref={log} role="log" aria-live="polite" className="flex flex-1 flex-col gap-2.5 overflow-y-auto bg-bg p-4">
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    "max-w-[86%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug",
                    m.role === "bot" ? "self-start rounded-bl-sm border border-hair bg-alt" : "self-end rounded-br-sm bg-inv text-inv-fg",
                  )}
                >
                  {m.text}
                </motion.div>
              ))}
              {busy && (
                <div className="flex gap-1 self-start rounded-2xl rounded-bl-sm border border-hair bg-alt px-4 py-3" aria-label="Escribiendo">
                  {[0, 1, 2].map((d) => (
                    <motion.i key={d} className="size-1.5 rounded-full bg-mut" animate={{ opacity: [0.25, 1, 0.25] }} transition={{ duration: 1, repeat: Infinity, delay: d * 0.18 }} />
                  ))}
                </div>
              )}
            </div>

            {sugg.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-hair bg-bg px-4 pb-1 pt-3">
                {sugg.map((t) => (
                  <button key={t} type="button" onClick={() => void send(t)} className="rounded-full border border-line px-3 py-1.5 text-[13px] text-fg transition hover:border-fg hover:bg-fg hover:text-bg">
                    {t}
                  </button>
                ))}
              </div>
            )}

            <form
              className="flex gap-2 border-t border-hair bg-bg p-3"
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Escribe tu mensaje"
                aria-label="Tu mensaje"
                className="h-11 min-w-0 flex-1 rounded-full border border-line bg-card px-4 text-[15px] text-fg placeholder:text-mut/70 focus-visible:border-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg"
              />
              <button type="submit" disabled={busy || !input.trim()} aria-label="Enviar" className="grid size-11 shrink-0 place-items-center rounded-full bg-inv text-inv-fg transition hover:opacity-85 disabled:opacity-40">
                <Send className="size-[18px]" />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
