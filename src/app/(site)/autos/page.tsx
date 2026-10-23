import type { Metadata } from "next";
import { VehicleCard } from "@/components/VehicleCard";
import { getCatalog, type CatalogFilters } from "@/lib/vehicles";
import { BODY_TYPES } from "@/lib/constants";

export const metadata: Metadata = { title: "Autos del patio" };
export const dynamic = "force-dynamic";

type Search = { q?: string; tipo?: string; max?: string; orden?: string };

export default async function AutosPage({ searchParams }: { searchParams: Search }) {
  const maxN = Number(searchParams.max);
  const orden: CatalogFilters["orden"] = (["precio-asc", "precio-desc", "km", "recientes"] as const).find((o) => o === searchParams.orden);
  const filters: CatalogFilters = {
    q: searchParams.q?.trim().slice(0, 40) || undefined,
    tipo: (BODY_TYPES as readonly string[]).includes(searchParams.tipo ?? "") ? searchParams.tipo : undefined,
    max: Number.isFinite(maxN) && maxN > 0 ? maxN : undefined,
    orden,
  };
  const vehicles = await getCatalog(filters);

  return (
    <div className="wrap">
      <div className="page-head">
        <h1>Autos del patio</h1>
        <p>Cada auto tiene su modelo 3D, sus defectos marcados y su ficha legal.</p>
      </div>
      <form className="filters" method="get">
        <label className="grow">
          <span className="sr-only">Buscar</span>
          <input className="field" style={{ width: "100%" }} type="search" name="q" placeholder="Busca por marca, modelo o color" defaultValue={filters.q} />
        </label>
        <label>
          <span className="sr-only">Tipo</span>
          <select className="field" name="tipo" defaultValue={filters.tipo ?? ""}>
            <option value="">Todos los tipos</option>
            {BODY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Precio máximo</span>
          <select className="field" name="max" defaultValue={filters.max ? String(filters.max) : ""}>
            <option value="">Cualquier precio</option>
            {[10000, 15000, 20000, 30000, 50000].map((p) => (
              <option key={p} value={p}>Hasta ${p.toLocaleString("es-EC")}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="sr-only">Ordenar</span>
          <select className="field" name="orden" defaultValue={filters.orden ?? "recientes"}>
            <option value="recientes">Más recientes</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="km">Menor kilometraje</option>
          </select>
        </label>
        <button className="btn sm" type="submit">Filtrar</button>
      </form>
      <div className="grid-cars">
        {vehicles.length ? vehicles.map((v) => <VehicleCard key={v.id} v={v} />) : <p className="empty-state">No encontramos autos con esos filtros.</p>}
      </div>
    </div>
  );
}
