import { unstable_cache } from "next/cache";
import { db } from "./db";
import { BODY_ART } from "./constants";

export interface VehicleCardData {
  id: string;
  slug: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  km: number;
  priceCents: number;
  bodyType: string;
  art: "suv" | "sedan" | "pickup";
  color: string;
  hex: string;
  status: string;
  coverUrl: string | null;
  defectCount: number;
  hasWarnings: boolean;
  severe: boolean;
}

const cardInclude = { defects: { select: { severity: true } }, legal: { select: { status: true } } } as const;

type CardRow = Awaited<ReturnType<typeof queryCards>>[number];

function toCard(v: CardRow): VehicleCardData {
  return {
    id: v.id,
    slug: v.slug,
    brand: v.brand,
    model: v.model,
    version: v.version,
    year: v.year,
    km: v.km,
    priceCents: v.priceCents,
    bodyType: v.bodyType,
    art: BODY_ART[v.bodyType] ?? "sedan",
    color: v.color,
    hex: v.hex,
    status: v.status,
    coverUrl: v.coverUrl,
    defectCount: v.defects.length,
    severe: v.defects.some((d) => d.severity === "MODERADO"),
    hasWarnings: v.legal.some((l) => l.status !== "OK"),
  };
}

function queryCards(where: object, orderBy: object, take?: number) {
  return db.vehicle.findMany({ where, orderBy, take, include: cardInclude });
}

export interface CatalogFilters {
  q?: string;
  tipo?: string;
  max?: number;
  orden?: "recientes" | "precio-asc" | "precio-desc" | "km";
}

async function queryCatalog(f: CatalogFilters, take?: number): Promise<VehicleCardData[]> {
  const where: Record<string, unknown> = { published: true, status: { not: "SOLD" } };
  if (f.tipo) where["bodyType"] = f.tipo;
  if (f.max) where["priceCents"] = { lte: f.max * 100 };
  if (f.q) {
    where["OR"] = [{ brand: { contains: f.q, mode: "insensitive" } }, { model: { contains: f.q, mode: "insensitive" } }, { version: { contains: f.q, mode: "insensitive" } }, { color: { contains: f.q, mode: "insensitive" } }];
  }
  const orderBy =
    f.orden === "precio-asc" ? { priceCents: "asc" } : f.orden === "precio-desc" ? { priceCents: "desc" } : f.orden === "km" ? { km: "asc" } : { createdAt: "desc" };
  return (await queryCards(where, orderBy, take)).map(toCard);
}

const cachedCatalog = unstable_cache(async (filters: string, take: number) => queryCatalog(JSON.parse(filters) as CatalogFilters, take || undefined), ["catalog-v1"], { revalidate: 60, tags: ["catalog"] });

/** Catálogo con caché de 60 s (el admin lo invalida al guardar), para no consultar la base en cada visita. */
export function getCatalog(f: CatalogFilters = {}, take?: number): Promise<VehicleCardData[]> {
  return cachedCatalog(JSON.stringify(f), take ?? 0);
}

const cachedCount = unstable_cache(async () => db.vehicle.count({ where: { published: true, status: { not: "SOLD" } } }), ["catalog-count-v1"], { revalidate: 60, tags: ["catalog"] });
export function getCatalogCount(): Promise<number> {
  return cachedCount();
}

export async function getVehicleBySlug(slug: string) {
  return db.vehicle.findFirst({
    where: { slug, published: true },
    include: { defects: true, legal: true, images: { orderBy: { position: "asc" } } },
  });
}

/** Resumen mínimo para el chatbot. */
export async function getBotInventory() {
  const rows = await db.vehicle.findMany({
    where: { published: true },
    select: { id: true, slug: true, brand: true, model: true, year: true, km: true, priceCents: true, bodyType: true, status: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  return rows;
}
