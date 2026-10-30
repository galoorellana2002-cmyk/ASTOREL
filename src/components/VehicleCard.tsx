import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CarArt } from "./CarArt";
import { cn } from "@/lib/utils";
import { kmFmt, money } from "@/lib/format";
import type { VehicleCardData } from "@/lib/vehicles";

export function VehicleCard({ v, className }: { v: VehicleCardData; className?: string }) {
  const tag = v.status === "RESERVED" ? "RESERVADO" : v.defectCount === 0 ? "SIN DETALLES" : "EXPLORAR EN 3D";
  return (
    <Link href={`/autos/${v.slug}`} className={cn("group flex min-w-0 flex-col border border-hair bg-card transition duration-300 hover:border-line hover:shadow-lift focus-visible:outline-fg", className)}>
      <div className="relative flex h-[236px] items-center justify-center overflow-hidden bg-alt px-[6%] pt-[6%]">
        {v.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.coverUrl} alt={`${v.brand} ${v.model} ${v.year}`} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
        ) : (
          <div className="w-full transition duration-700 ease-out group-hover:scale-[1.05]">
            <CarArt type={v.art} hex={v.hex} />
          </div>
        )}
        <span className="absolute left-4 top-4 z-[2] bg-white px-2.5 py-[7px] text-[9px] leading-none tracking-[.1em] text-black">{tag}</span>
      </div>
      <div className="flex flex-1 flex-col gap-[17px] p-[22px]">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[22px] leading-tight tracking-[-0.03em]">
            {v.brand} {v.model}
          </h3>
          <span className="text-xs text-mut">{v.version}</span>
        </div>
        <div className="flex flex-wrap gap-x-3 text-[11px] text-mut">
          <span>{v.year}</span>
          <span>{kmFmt(v.km)}</span>
          {v.color && <span>{v.color}</span>}
        </div>
        <div className="mt-auto flex items-end justify-between border-t border-hair pt-[17px]">
          <div className="flex flex-col gap-[5px]">
            <span className="text-[9px] tracking-[.1em] text-mut">PRECIO CONTADO · USD</span>
            <span className="text-[22px] tabular-nums">{money(v.priceCents)}</span>
          </div>
          <ArrowUpRight aria-hidden="true" strokeWidth={1.4} className="size-6 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  );
}
