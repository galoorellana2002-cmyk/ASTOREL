"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { VehicleCard } from "./VehicleCard";
import { cn } from "@/lib/utils";
import type { VehicleCardData } from "@/lib/vehicles";

export function CatalogSlider({ vehicles }: { vehicles: VehicleCardData[] }) {
  const types = ["Todos", ...Array.from(new Set(vehicles.map((v) => v.bodyType)))];
  const [tipo, setTipo] = useState("Todos");
  const [edge, setEdge] = useState({ start: true, end: false });
  const track = useRef<HTMLDivElement>(null);
  const list = tipo === "Todos" ? vehicles : vehicles.filter((v) => v.bodyType === tipo);

  const measure = useCallback(() => {
    const t = track.current;
    if (!t) return;
    setEdge({ start: t.scrollLeft <= 2, end: t.scrollLeft >= t.scrollWidth - t.clientWidth - 2 });
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure, list.length]);

  const scrollBy = (dir: 1 | -1) => {
    const t = track.current;
    if (t) t.scrollBy({ left: dir * t.clientWidth * 0.8, behavior: "smooth" });
  };

  const sl = "absolute top-[28%] z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/40 bg-black/60 text-white backdrop-blur-md transition hover:bg-white hover:text-black md:grid";

  return (
    <>
      <div className="mb-2 mt-8 flex flex-wrap items-center justify-center gap-3">
        <div role="group" aria-label="Tipo de auto" className="flex max-w-full gap-2 overflow-x-auto p-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tipo === t}
              onClick={() => {
                setTipo(t);
                if (track.current) track.current.scrollLeft = 0;
              }}
              className={cn("relative min-h-[38px] shrink-0 rounded-full border px-[18px] py-[7px] text-sm transition", tipo === t ? "border-fg bg-fg text-bg" : "border-line text-mut hover:border-fg hover:text-fg")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-7">
        <button type="button" aria-label="Autos anteriores" onClick={() => scrollBy(-1)} className={cn(sl, "left-1.5", edge.start && "md:hidden")}>
          <ChevronLeft className="size-5" />
        </button>
        <div ref={track} onScroll={measure} className="flex snap-x snap-proximity gap-5 overflow-x-auto pb-4 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.length ? (
            list.map((v, i) => (
              <motion.div key={`${tipo}-${v.id}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: Math.min(i, 5) * 0.07, ease: [0.2, 0.7, 0.2, 1] }} className="flex w-[82%] shrink-0 snap-start sm:w-[calc((100%-20px)/2)] lg:w-[calc((100%-40px)/3)]">
                <VehicleCard v={v} className="w-full" />
              </motion.div>
            ))
          ) : (
            <p className="w-full py-10 text-center text-mut">No hay autos de este tipo por ahora.</p>
          )}
        </div>
        <button type="button" aria-label="Más autos" onClick={() => scrollBy(1)} className={cn(sl, "right-1.5", edge.end && "md:hidden")}>
          <ChevronRight className="size-5" />
        </button>
      </div>
    </>
  );
}
