import Link from "next/link";
import { CarArt } from "./CarArt";
import { kmFmt, money } from "@/lib/format";
import type { VehicleCardData } from "@/lib/vehicles";

export function VehicleCard({ v }: { v: VehicleCardData }) {
  const defects = v.defectCount === 0 ? { txt: "Sin detalles registrados", cls: "ok" } : { txt: `${v.defectCount} ${v.defectCount === 1 ? "detalle" : "detalles"}`, cls: v.severe ? "bad" : "warn" };
  const legal = v.hasWarnings ? { txt: "Ficha con avisos", cls: "warn" } : { txt: "Ficha legal al día", cls: "ok" };
  return (
    <Link href={`/autos/${v.slug}`} className="card">
      <div className="art">
        {v.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.coverUrl} alt={`${v.brand} ${v.model} ${v.year}`} loading="lazy" />
        ) : (
          <CarArt type={v.art} hex={v.hex} />
        )}
        {v.status === "RESERVED" && <span className="badge-sold">Reservado</span>}
      </div>
      <div className="info">
        <h3>
          {v.brand} {v.model}
        </h3>
        <span className="meta">
          {v.year} · {kmFmt(v.km)}
          {v.color ? ` · ${v.color}` : ""}
        </span>
        <span className="price">{money(v.priceCents)}</span>
        <div className="chips">
          <span className="chip">
            <i className={`dot ${defects.cls}`} />
            {defects.txt}
          </span>
          <span className="chip">
            <i className={`dot ${legal.cls}`} />
            {legal.txt}
          </span>
        </div>
        <span className="go" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
