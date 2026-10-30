"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { waLink } from "@/lib/format";

const field = "w-full border-0 border-b border-line bg-transparent pb-3.5 pt-0 text-[13px] text-fg placeholder:text-mut focus:border-fg focus:outline-none focus-visible:outline-none";
const label = "mb-3 block text-[11px]";

/** No hay servidor: arma el mensaje y lo abre en WhatsApp, que es donde atiende el patio. */
export function ContactForm({ interests }: { interests: string[] }) {
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const lines = [
      "Hola, quiero agendar una asesoría.",
      `Nombre: ${String(f.get("nombre") ?? "").trim()}`,
      `Teléfono: ${String(f.get("telefono") ?? "").trim()}`,
      String(f.get("correo") ?? "").trim() && `Correo: ${String(f.get("correo")).trim()}`,
      String(f.get("interes") ?? "") && `Me interesa: ${String(f.get("interes"))}`,
    ].filter(Boolean);
    window.open(waLink(lines.join("\n")), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex min-w-0 flex-1 flex-col gap-[22px]">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="c-nombre" className={label}>Nombre completo</label>
          <input id="c-nombre" name="nombre" required maxLength={80} autoComplete="name" placeholder="Tu nombre" className={field} />
        </div>
        <div>
          <label htmlFor="c-tel" className={label}>Teléfono</label>
          <input id="c-tel" name="telefono" type="tel" required maxLength={20} autoComplete="tel" inputMode="tel" placeholder="+593 9" className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="c-mail" className={label}>Correo electrónico <span className="text-mut">(opcional)</span></label>
        <input id="c-mail" name="correo" type="email" maxLength={100} autoComplete="email" placeholder="nombre@correo.com" className={field} />
      </div>
      <div>
        <label htmlFor="c-int" className={label}>¿Qué auto te interesa?</label>
        <select id="c-int" name="interes" defaultValue="" className={`${field} cursor-pointer`}>
          <option value="">Aún no lo sé</option>
          {interests.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <label className="flex cursor-pointer items-start gap-2.5 text-[11px] text-mut">
        <input type="checkbox" required className="mt-0.5 size-[14px] shrink-0 cursor-pointer accent-[rgb(var(--fg))]" />
        Acepto que ASTOREL me contacte por WhatsApp con la información que envío.
      </label>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[11px] text-mut" role="status">{sent ? "Se abrió WhatsApp con tu mensaje. Solo falta enviarlo." : "Se abre WhatsApp con tus datos listos para enviar."}</p>
        <button type="submit" className="inline-flex h-[50px] items-center gap-6 bg-inv px-[22px] text-[13px] text-inv-fg transition hover:opacity-85 focus-visible:outline-fg">
          Agendar asesoría
          <ArrowUpRight className="size-[17px]" strokeWidth={1.4} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
