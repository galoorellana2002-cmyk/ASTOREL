import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CarArt } from "./CarArt";
import { Dot } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { kmFmt, money } from "@/lib/format";
import type { VehicleCardData } from "@/lib/vehicles";

export function VehicleCard({ v, className }: { v: VehicleCardData; className?: string }) {
  const defects = v.defectCount === 0 ? { txt: "Sin detalles registrados", tone: "ok" as const } : { txt: `${v.defectCount} ${v.defectCount === 1 ? "detalle" : "detalles"}`, tone: v.severe ? ("bad" as const) : ("warn" as const) };
  const legal = v.hasWarnings ? { txt: "Ficha con avisos", tone: "warn" as const } : { txt: "Ficha legal al día", tone: "ok" as const };
  return (
    <Link
      href={`/autos/${v.slug}`}
      className={cn("group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-white/10 bg-black text-white transition duration-500 ease-out hover:-translate-y-1.5 hover:border-white/25 hover:shadow-lift focus-visible:outline-fg", className)}
    >
      <div className="relative flex aspect-[16/10] items-center justify-center bg-[radial-gradient(ellipse_80%_70%_at_50%_62%,#34353b_0%,#0d0e11_70%)] px-[6%] pt-[6%]">
        {v.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.coverUrl} alt={`${v.brand} ${v.model} ${v.year}`} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
        ) : (
          <div className="w-full transition duration-700 ease-out group-hover:scale-[1.05]">
            <CarArt type={v.art} hex={v.hex} />
          </div>
        )}
        {v.status === "RESERVED" && <span className="absolute left-3.5 top-3.5 z-[2] rounded-full bg-white px-2.5 py-0.5 text-xs text-black">Reservado</span>}
      </div>
      <div className="relative flex flex-1 flex-col gap-0.5 px-5 pb-5 pt-[18px]">
        <h3 className="pr-14 text-[26px] leading-[1.15] tracking-tight">
          {v.brand} {v.model}
        </h3>
        <span className="text-[15px] text-[#9a9ba0]">
          {v.year} · {kmFmt(v.km)}
          {v.color ? ` · ${v.color}` : ""}
        </span>
        <span className="mt-2.5 text-xl tabular-nums">{money(v.priceCents)}</span>
        <div className="mt-3.5 flex flex-wrap gap-2 pr-14">
          {[defects, legal].map((c) => (
            <span key={c.txt} className="inline-flex items-center gap-[7px] rounded-full border border-[#34353a] px-2.5 py-[3px] text-[13px] text-[#d4d5d8]">
              <Dot tone={c.tone} />
              {c.txt}
            </span>
          ))}
        </div>
        <span aria-hidden="true" className="absolute bottom-[18px] right-[18px] grid size-10 place-items-center rounded-full border border-[#55565b] transition duration-300 group-hover:border-white group-hover:bg-white group-hover:text-black">
          <ArrowRight className="size-[18px] transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={1.8} />
        </span>
      </div>
    </Link>
  );
}
