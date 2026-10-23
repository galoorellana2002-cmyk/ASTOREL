"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VehicleCard } from "./VehicleCard";
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

  return (
    <>
      <div className="toolbar">
        <div className="seg" role="group" aria-label="Tipo de auto">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tipo === t}
              onClick={() => {
                setTipo(t);
                if (track.current) track.current.scrollLeft = 0;
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <div className="slider">
        <button type="button" className="sl-btn prev" aria-label="Autos anteriores" hidden={edge.start} onClick={() => scrollBy(-1)}>
          <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div className="track" ref={track} onScroll={measure}>
          {list.length ? list.map((v) => <VehicleCard key={v.id} v={v} />) : <p className="note" style={{ width: "100%" }}>No hay autos de este tipo por ahora.</p>}
        </div>
        <button type="button" className="sl-btn next" aria-label="Más autos" hidden={edge.end} onClick={() => scrollBy(1)}>
          <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </>
  );
}
