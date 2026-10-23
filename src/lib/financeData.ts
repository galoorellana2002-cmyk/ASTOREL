import "server-only";
import { db } from "./db";
import { summarize, type Summary } from "./finance";

export const PERIODS = [
  { id: "todo", label: "Todo el historial" },
  { id: "anio", label: "Este año" },
  { id: "3m", label: "Últimos 3 meses" },
  { id: "mes", label: "Este mes" },
] as const;
export type PeriodId = (typeof PERIODS)[number]["id"];

export function parsePeriod(v: unknown): PeriodId {
  return PERIODS.some((p) => p.id === v) ? (v as PeriodId) : "todo";
}
export function periodLabel(id: PeriodId): string {
  return PERIODS.find((p) => p.id === id)?.label ?? "";
}
function since(id: PeriodId): Date | null {
  const n = new Date();
  if (id === "mes") return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1));
  if (id === "3m") return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth() - 2, 1));
  if (id === "anio") return new Date(Date.UTC(n.getUTCFullYear(), 0, 1));
  return null;
}

export async function loadFinance(period: PeriodId) {
  const from = since(period);
  const [movements, vehicles] = await Promise.all([
    db.movement.findMany({ where: from ? { date: { gte: from } } : {}, orderBy: [{ date: "desc" }, { createdAt: "desc" }] }),
    db.vehicle.findMany({ select: { id: true, brand: true, model: true, year: true, status: true }, orderBy: { createdAt: "desc" } }),
  ]);
  const vehs = vehicles.map((v) => ({ id: v.id, label: `${v.brand} ${v.model} ${v.year}`, status: v.status }));
  const summary: Summary = summarize(movements, vehs);
  return { movements, vehicles: vehs, summary };
}
