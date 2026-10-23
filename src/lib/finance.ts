import { CATEGORY_LABEL, VEHICLE_COST_CATEGORIES } from "./constants";

export interface Mov {
  type: string;
  category: string;
  amountCents: number;
  date: Date;
  vehicleId: string | null;
  description?: string;
}
export interface Veh {
  id: string;
  label: string;
  status: string;
}

export interface CategoryTotal { category: string; label: string; cents: number; pct: number }
export interface MonthTotal { key: string; label: string; income: number; expense: number }
export interface VehicleResult {
  vehicleId: string;
  label: string;
  status: string;
  costCents: number;
  revenueCents: number;
  /** Utilidad solo si el auto ya se vendió y tiene costo registrado. */
  profitCents: number | null;
  missingCost: boolean;
}
export interface Summary {
  incomeCents: number;
  expenseCents: number;
  /** Flujo de caja del periodo: ingresos - gastos. */
  cashCents: number;
  /** Utilidad de autos vendidos (venta - costos directos). */
  salesProfitCents: number;
  /** Gastos generales (no ligados al costo de un auto). */
  operatingCents: number;
  /** Utilidad real = utilidad de autos vendidos - gastos generales. */
  netCents: number;
  /** Dinero invertido en autos que aún no se venden. */
  stockCents: number;
  marginPct: number | null;
  expensesByCategory: CategoryTotal[];
  byMonth: MonthTotal[];
  vehicles: VehicleResult[];
  insights: string[];
}

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const usd = (c: number) => `${c < 0 ? "-" : ""}$${Math.abs(Math.round(c / 100)).toLocaleString("es-EC")}`;
export { usd };

export function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  return `${MONTHS[Number(m) - 1]} ${String(y).slice(2)}`;
}
/** Fecha elegida por el usuario (YYYY-MM-DD) guardada a mediodía UTC para que no cambie de día por zona horaria. */
export function parseDay(day: string): Date {
  return new Date(`${day}T12:00:00.000Z`);
}

const DIRECT = new Set<string>(VEHICLE_COST_CATEGORIES);

export function summarize(movs: Mov[], vehicles: Veh[]): Summary {
  const incomeCents = movs.filter((m) => m.type === "INGRESO").reduce((s, m) => s + m.amountCents, 0);
  const expenseCents = movs.filter((m) => m.type === "GASTO").reduce((s, m) => s + m.amountCents, 0);

  // Gastos por categoría
  const catMap = new Map<string, number>();
  for (const m of movs) if (m.type === "GASTO") catMap.set(m.category, (catMap.get(m.category) ?? 0) + m.amountCents);
  const expensesByCategory: CategoryTotal[] = [...catMap.entries()]
    .map(([category, cents]) => ({ category, label: CATEGORY_LABEL[category] ?? category, cents, pct: expenseCents ? (cents / expenseCents) * 100 : 0 }))
    .sort((a, b) => b.cents - a.cents);

  // Por mes (sin huecos entre el primero y el último)
  const monthMap = new Map<string, { income: number; expense: number }>();
  for (const m of movs) {
    const k = monthKey(m.date);
    const row = monthMap.get(k) ?? { income: 0, expense: 0 };
    if (m.type === "INGRESO") row.income += m.amountCents;
    else row.expense += m.amountCents;
    monthMap.set(k, row);
  }
  const byMonth: MonthTotal[] = [];
  const keys = [...monthMap.keys()].sort();
  if (keys.length) {
    const [fy, fm] = keys[0]!.split("-").map(Number) as [number, number];
    const [ly, lm] = keys[keys.length - 1]!.split("-").map(Number) as [number, number];
    for (let y = fy, mo = fm; y < ly || (y === ly && mo <= lm); mo === 12 ? (y++, (mo = 1)) : mo++) {
      const k = `${y}-${String(mo).padStart(2, "0")}`;
      const r = monthMap.get(k) ?? { income: 0, expense: 0 };
      byMonth.push({ key: k, label: monthLabel(k), ...r });
    }
  }

  // Por auto
  const results: VehicleResult[] = [];
  for (const v of vehicles) {
    const mine = movs.filter((m) => m.vehicleId === v.id);
    if (!mine.length) continue;
    const costCents = mine.filter((m) => m.type === "GASTO" && DIRECT.has(m.category)).reduce((s, m) => s + m.amountCents, 0);
    const revenueCents = mine.filter((m) => m.type === "INGRESO" && m.category === "VENTA_AUTO").reduce((s, m) => s + m.amountCents, 0);
    const hasPurchase = mine.some((m) => m.type === "GASTO" && m.category === "COMPRA_AUTO");
    const sold = revenueCents > 0;
    results.push({
      vehicleId: v.id, label: v.label, status: v.status, costCents, revenueCents,
      profitCents: sold && hasPurchase ? revenueCents - costCents : null,
      missingCost: sold && !hasPurchase,
    });
  }
  results.sort((a, b) => (b.profitCents ?? -Infinity) - (a.profitCents ?? -Infinity));

  const salesProfitCents = results.reduce((s, r) => s + (r.profitCents ?? 0), 0);
  const operatingCents = movs
    .filter((m) => m.type === "GASTO" && !(DIRECT.has(m.category) && m.vehicleId))
    .reduce((s, m) => s + m.amountCents, 0);
  const netCents = salesProfitCents - operatingCents;
  const stockCents = results.filter((r) => r.revenueCents === 0).reduce((s, r) => s + r.costCents, 0);
  const soldRevenue = results.filter((r) => r.profitCents !== null).reduce((s, r) => s + r.revenueCents, 0);
  const marginPct = soldRevenue > 0 ? (netCents / soldRevenue) * 100 : null;

  const base: Summary = {
    incomeCents, expenseCents, cashCents: incomeCents - expenseCents, salesProfitCents, operatingCents, netCents, stockCents,
    marginPct, expensesByCategory, byMonth, vehicles: results, insights: [],
  };
  base.insights = buildInsights(base);
  return base;
}

/** Observaciones calculadas con reglas: sirven solas y como base del asistente de IA. */
export function buildInsights(s: Summary): string[] {
  const out: string[] = [];
  if (!s.incomeCents && !s.expenseCents) return ["Aún no hay movimientos en este periodo. Registra tus gastos e ingresos para ver el análisis."];

  if (s.netCents < 0) out.push(`El periodo cierra con pérdida de ${usd(-s.netCents)} (utilidad de autos vendidos ${usd(s.salesProfitCents)} contra gastos generales ${usd(s.operatingCents)}).`);
  else out.push(`El periodo cierra con utilidad de ${usd(s.netCents)} tras cubrir ${usd(s.operatingCents)} de gastos generales.`);

  if (s.cashCents < 0 && s.stockCents > 0)
    out.push(`El flujo de caja es negativo (${usd(s.cashCents)}) en buena parte porque hay ${usd(s.stockCents)} invertidos en autos sin vender: es dinero parado, no necesariamente pérdida.`);

  const top = s.expensesByCategory[0];
  if (top && s.expenseCents > 0) out.push(`Tu mayor gasto es «${top.label}»: ${usd(top.cents)} (${top.pct.toFixed(0)}% del total).`);

  const general = s.expensesByCategory.filter((c) => !DIRECT.has(c.category));
  const generalTop = general[0];
  if (generalTop && generalTop.pct >= 15 && generalTop.category !== top?.category)
    out.push(`Entre los gastos generales pesa «${generalTop.label}» con ${usd(generalTop.cents)}.`);

  const losers = s.vehicles.filter((v) => v.profitCents !== null && v.profitCents < 0);
  for (const v of losers) out.push(`${v.label} se vendió con pérdida de ${usd(-(v.profitCents ?? 0))}. Revisa si el costo de reparación fue más alto de lo previsto.`);

  const best = s.vehicles.find((v) => v.profitCents !== null);
  if (best && (best.profitCents ?? 0) > 0) out.push(`El auto más rentable es ${best.label}, con ${usd(best.profitCents ?? 0)} de utilidad.`);

  const missing = s.vehicles.filter((v) => v.missingCost);
  if (missing.length) out.push(`Falta registrar la compra de ${missing.map((v) => v.label).join(", ")}: sin ese costo no se puede calcular su utilidad.`);

  if (s.byMonth.length >= 2) {
    const last = s.byMonth[s.byMonth.length - 1]!;
    const prev = s.byMonth[s.byMonth.length - 2]!;
    if (prev.expense > 0) {
      const ch = ((last.expense - prev.expense) / prev.expense) * 100;
      if (Math.abs(ch) >= 20) out.push(`Los gastos de ${last.label} ${ch > 0 ? "subieron" : "bajaron"} ${Math.abs(ch).toFixed(0)}% frente a ${prev.label}.`);
    }
  }
  return out;
}

/** Texto compacto con las cifras reales, para dárselo a la IA como único contexto. */
export function summaryForAI(s: Summary, periodLabel: string): string {
  const L: string[] = [
    `PERIODO: ${periodLabel}`,
    `Ingresos: ${usd(s.incomeCents)} · Gastos: ${usd(s.expenseCents)} · Flujo de caja: ${usd(s.cashCents)}`,
    `Utilidad de autos vendidos: ${usd(s.salesProfitCents)} · Gastos generales: ${usd(s.operatingCents)} · Utilidad real: ${usd(s.netCents)}`,
    `Dinero invertido en autos sin vender: ${usd(s.stockCents)}`,
    `Margen sobre ventas: ${s.marginPct === null ? "sin ventas" : s.marginPct.toFixed(1) + "%"}`,
    "GASTOS POR CATEGORÍA:",
    ...s.expensesByCategory.map((c) => `- ${c.label}: ${usd(c.cents)} (${c.pct.toFixed(0)}%)`),
    "POR MES:",
    ...s.byMonth.map((m) => `- ${m.label}: ingresos ${usd(m.income)}, gastos ${usd(m.expense)}`),
    "POR AUTO:",
    ...s.vehicles.map((v) => `- ${v.label} [${v.status}]: costo ${usd(v.costCents)}, venta ${usd(v.revenueCents)}, utilidad ${v.profitCents === null ? "n/d" : usd(v.profitCents)}`),
  ];
  return L.join("\n");
}
