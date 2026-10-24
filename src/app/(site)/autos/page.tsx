import type { Metadata } from "next";
import { Search } from "lucide-react";
import { VehicleCard } from "@/components/VehicleCard";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Reveal } from "@/components/ui/reveal";
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
    <div className="container">
      <div className="pb-2 pt-[clamp(40px,6vw,72px)]">
        <Reveal>
          <h1 className="text-[clamp(34px,5vw,60px)] leading-[1.05] tracking-tightest">Autos del patio</h1>
          <p className="mt-2.5 max-w-[560px] text-[19px] text-mut">Cada auto tiene su modelo 3D, sus defectos marcados y su ficha legal.</p>
        </Reveal>
      </div>

      <form method="get" className="my-7 flex flex-wrap items-center gap-2.5 rounded-2xl border border-hair bg-alt p-3">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Buscar</span>
          <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-mut" />
          <Input type="search" name="q" placeholder="Busca por marca, modelo o color" defaultValue={filters.q} className="pl-10" />
        </label>
        <label>
          <span className="sr-only">Tipo</span>
          <Select name="tipo" defaultValue={filters.tipo ?? ""}>
            <option value="">Todos los tipos</option>
            {BODY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </label>
        <label>
          <span className="sr-only">Precio máximo</span>
          <Select name="max" defaultValue={filters.max ? String(filters.max) : ""}>
            <option value="">Cualquier precio</option>
            {[10000, 15000, 20000, 30000, 50000].map((p) => (
              <option key={p} value={p}>Hasta ${p.toLocaleString("es-EC")}</option>
            ))}
          </Select>
        </label>
        <label>
          <span className="sr-only">Ordenar</span>
          <Select name="orden" defaultValue={filters.orden ?? "recientes"}>
            <option value="recientes">Más recientes</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="km">Menor kilometraje</option>
          </Select>
        </label>
        <Button type="submit" size="sm">Filtrar</Button>
      </form>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-5 pb-16">
        {vehicles.length ? (
          vehicles.map((v, i) => (
            <Reveal key={v.id} delay={Math.min(i, 6) * 0.05} className="flex">
              <VehicleCard v={v} className="w-full" />
            </Reveal>
          ))
        ) : (
          <p className="col-span-full py-16 text-center text-lg text-mut">No encontramos autos con esos filtros.</p>
        )}
      </div>
    </div>
  );
}
