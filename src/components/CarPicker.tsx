"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CarArt } from "./CarArt";
import { kmFmt, money, waLink } from "@/lib/format";
import type { VehicleCardData } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

/** La hoja de un auto: eliges un auto del patio y la hoja se llena con sus datos reales. */
export function CarPicker({ vehicles }: { vehicles: VehicleCardData[] }) {
  const shown = vehicles.slice(0, 4);
  const [idx, setIdx] = useState(0);
  const v = shown[idx];

  if (!v) {
    return (
      <p className="mt-10 text-[17px]">
        Pronto habrá autos nuevos en el patio. <Link href="/autos" className="underline underline-offset-4">Ver el catálogo</Link>
      </p>
    );
  }

  const defects = v.defectCount === 0 ? "Sin detalles registrados" : `${v.defectCount} ${v.defectCount === 1 ? "detalle marcado" : "detalles marcados"} sobre el auto`;
  const legal = v.hasWarnings ? "Ficha legal con avisos" : "Ficha legal al día";
  const name = `${v.brand} ${v.model} ${v.year}`;

  return (
    <div className="grid gap-10 md:grid-cols-2 md:gap-12">
      <div className="relative aspect-square overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_80%_70%_at_50%_58%,#34353b_0%,#0b0b0d_72%)]">
        <AnimatePresence initial={false}>
          <motion.div key={v.id} className="absolute inset-0 flex items-center justify-center px-[8%]" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            {v.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={v.coverUrl} alt={name} loading="lazy" className="absolute inset-0 size-full object-cover" />
            ) : (
              <div className="spin w-full">
                <CarArt type={v.art} hex={v.hex} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        {v.status === "RESERVED" && <span className="absolute left-4 top-4 z-[2] rounded-full bg-white px-3 py-1 text-[13px] text-black">Reservado</span>}
      </div>

      <div className="flex flex-col justify-between gap-10">
        <div>
          <h2 className="text-[clamp(40px,5.6vw,88px)] leading-[1.02] tracking-tightest">Elige un auto y lee su hoja.</h2>
          <div role="tablist" aria-label="Autos del patio" className="mt-8 flex flex-wrap gap-x-6 gap-y-1">
            {shown.map((c, i) => (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={i === idx}
                onClick={() => setIdx(i)}
                className={cn("min-h-11 text-[18px] underline-offset-[8px] transition hover:text-fg", i === idx ? "text-fg underline decoration-2" : "text-mut")}
              >
                {c.brand} {c.model}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={v.id} role="tabpanel" aria-label={name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
            <h3 className="text-[clamp(26px,2.4vw,34px)] leading-tight tracking-tight">{name}</h3>
            <p className="mt-2 text-[clamp(26px,2.4vw,34px)] tabular-nums">{money(v.priceCents)}</p>
            <ul className="mt-6 max-w-[40ch] text-[17px] leading-relaxed">
              <li>
                {kmFmt(v.km)}
                {v.color ? ` · ${v.color}` : ""}
                {v.version ? ` · ${v.version}` : ""}
              </li>
              <li>{defects}</li>
              <li>{legal}</li>
            </ul>
          </motion.div>
        </AnimatePresence>

        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <Link href={`/autos/${v.slug}`} className="flex min-h-[64px] items-center justify-center rounded-lg bg-inv px-5 text-[17px] text-inv-fg transition hover:opacity-85 active:scale-[.98]">
            Ver su hoja completa
          </Link>
          <a
            href={waLink(`Hola, quiero información sobre el ${name}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[64px] items-center justify-center rounded-lg bg-fg/[.07] px-5 text-[17px] transition hover:bg-fg/[.12] active:scale-[.98]"
          >
            Preguntar por este auto
          </a>
        </div>
        <Link href="/autos" className="text-[15px] underline underline-offset-4">
          Ver todos los autos del patio
        </Link>
      </div>
    </div>
  );
}
