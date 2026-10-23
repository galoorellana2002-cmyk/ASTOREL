import { CATEGORY_LABEL } from "./constants";
import { usd, type Summary } from "./finance";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const INK = "#0e0e12", MUT = "#6b6e76", LINE = "#e3e3e6", BAR = "#0e0e12", GREEN = "#11803f", RED = "#d5001c", SOFT = "#f3f3f5";

/** Reporte detallado de gastos como SVG autónomo (se abre en el navegador, Illustrator, Figma, etc.). */
export function buildFinanceSvg(s: Summary, opts: { patio: string; period: string; generated: string }): string {
  const W = 1200, M = 56;
  const out: string[] = [];
  let y = 0;
  const t = (x: number, yy: number, txt: string, o: { size?: number; w?: number; fill?: string; anchor?: string } = {}) =>
    out.push(`<text x="${x}" y="${yy}" font-size="${o.size ?? 14}" font-weight="${o.w ?? 400}" fill="${o.fill ?? INK}"${o.anchor ? ` text-anchor="${o.anchor}"` : ""}>${esc(txt)}</text>`);

  // Encabezado
  t(M, 70, opts.patio, { size: 14, w: 600, fill: MUT });
  t(M, 112, "Reporte de gastos y utilidad", { size: 38, w: 600 });
  t(M, 142, `${opts.period} · generado el ${opts.generated}`, { size: 14, fill: MUT });
  y = 180;

  // Tarjetas de cifras
  const cards: Array<[string, string, string]> = [
    ["Ingresos", usd(s.incomeCents), INK],
    ["Gastos", usd(s.expenseCents), INK],
    ["Flujo de caja", usd(s.cashCents), s.cashCents < 0 ? RED : GREEN],
    ["Utilidad real", usd(s.netCents), s.netCents < 0 ? RED : GREEN],
  ];
  const cw = (W - 2 * M - 3 * 16) / 4;
  cards.forEach(([label, val, color], i) => {
    const x = M + i * (cw + 16);
    out.push(`<rect x="${x}" y="${y}" width="${cw}" height="96" rx="14" fill="${SOFT}"/>`);
    t(x + 20, y + 32, label, { size: 13, fill: MUT });
    t(x + 20, y + 72, val, { size: 30, w: 600, fill: color });
  });
  y += 96 + 14;
  t(M, y + 14, `Utilidad de autos vendidos ${usd(s.salesProfitCents)} − gastos generales ${usd(s.operatingCents)} = utilidad real ${usd(s.netCents)}. Invertido en autos sin vender: ${usd(s.stockCents)}.`, { size: 13, fill: MUT });
  y += 52;

  // Gastos por categoría
  t(M, y, "Gastos por categoría", { size: 20, w: 600 });
  y += 24;
  const maxCat = Math.max(1, ...s.expensesByCategory.map((c) => c.cents));
  const labelW = 230, valW = 150, barMax = W - 2 * M - labelW - valW;
  if (!s.expensesByCategory.length) { t(M, y + 20, "Sin gastos registrados en este periodo.", { fill: MUT }); y += 44; }
  for (const c of s.expensesByCategory) {
    t(M, y + 22, CATEGORY_LABEL[c.category] ?? c.label, { size: 14 });
    const bw = Math.max(3, (c.cents / maxCat) * barMax);
    out.push(`<rect x="${M + labelW}" y="${y + 8}" width="${bw.toFixed(1)}" height="20" rx="4" fill="${BAR}" opacity="${(0.35 + 0.65 * (c.cents / maxCat)).toFixed(2)}"/>`);
    t(M + labelW + bw + 10, y + 23, `${usd(c.cents)} · ${c.pct.toFixed(0)}%`, { size: 13, fill: MUT });
    y += 38;
  }
  y += 40;

  // Ingresos vs gastos por mes
  t(M, y, "Ingresos y gastos por mes", { size: 20, w: 600 });
  y += 18;
  const chartH = 190, chartTop = y + 14, base = chartTop + chartH;
  const months = s.byMonth.slice(-12);
  const maxM = Math.max(1, ...months.map((m) => Math.max(m.income, m.expense)));
  out.push(`<line x1="${M}" y1="${base}" x2="${W - M}" y2="${base}" stroke="${LINE}"/>`);
  if (!months.length) t(M, base - 80, "Sin movimientos.", { fill: MUT });
  const slot = (W - 2 * M) / Math.max(months.length, 1);
  months.forEach((m, i) => {
    const cx = M + slot * i + slot / 2, bw = Math.min(34, slot / 3);
    const hi = (m.income / maxM) * (chartH - 24), he = (m.expense / maxM) * (chartH - 24);
    out.push(`<rect x="${(cx - bw - 2).toFixed(1)}" y="${(base - hi).toFixed(1)}" width="${bw.toFixed(1)}" height="${hi.toFixed(1)}" rx="3" fill="${GREEN}"/>`);
    out.push(`<rect x="${(cx + 2).toFixed(1)}" y="${(base - he).toFixed(1)}" width="${bw.toFixed(1)}" height="${he.toFixed(1)}" rx="3" fill="${BAR}"/>`);
    t(cx, base + 20, m.label, { size: 12, fill: MUT, anchor: "middle" });
  });
  y = base + 34;
  out.push(`<rect x="${M}" y="${y}" width="12" height="12" rx="2" fill="${GREEN}"/>`);
  t(M + 18, y + 11, "Ingresos", { size: 12, fill: MUT });
  out.push(`<rect x="${M + 90}" y="${y}" width="12" height="12" rx="2" fill="${BAR}"/>`);
  t(M + 108, y + 11, "Gastos", { size: 12, fill: MUT });
  y += 48;

  // Tabla por auto
  t(M, y, "Resultado por auto", { size: 20, w: 600 });
  y += 14;
  const cols = [M, M + 380, M + 560, M + 740, M + 920];
  const head = ["Auto", "Costo total", "Venta", "Utilidad", "Estado"];
  head.forEach((h, i) => t(cols[i]!, y + 26, h, { size: 12, w: 600, fill: MUT }));
  y += 36;
  out.push(`<line x1="${M}" y1="${y}" x2="${W - M}" y2="${y}" stroke="${LINE}"/>`);
  if (!s.vehicles.length) { t(M, y + 30, "Aún no hay movimientos ligados a un auto.", { fill: MUT }); y += 46; }
  for (const v of s.vehicles) {
    t(cols[0]!, y + 28, v.label, { size: 14 });
    t(cols[1]!, y + 28, usd(v.costCents), { size: 14 });
    t(cols[2]!, y + 28, v.revenueCents ? usd(v.revenueCents) : "—", { size: 14 });
    const p = v.profitCents;
    t(cols[3]!, y + 28, p === null ? (v.missingCost ? "falta costo" : "sin vender") : usd(p), { size: 14, w: 600, fill: p === null ? MUT : p < 0 ? RED : GREEN });
    t(cols[4]!, y + 28, v.status === "SOLD" ? "Vendido" : v.status === "RESERVED" ? "Reservado" : "Disponible", { size: 14, fill: MUT });
    out.push(`<line x1="${M}" y1="${y + 42}" x2="${W - M}" y2="${y + 42}" stroke="${LINE}"/>`);
    y += 42;
  }
  y += 44;

  // Observaciones
  t(M, y, "Observaciones", { size: 20, w: 600 });
  y += 10;
  for (const line of s.insights) {
    const parts = wrap(line, 120);
    parts.forEach((p, i) => t(M + (i ? 14 : 0), y + 28 + i * 20, (i ? "" : "• ") + p, { size: 14 }));
    y += 12 + parts.length * 20;
  }
  y += 50;
  t(M, y, "Cifras calculadas con los movimientos registrados. Documento de gestión interna, no reemplaza la contabilidad ni las declaraciones al SRI.", { size: 11, fill: MUT });
  y += 40;

  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${y}" viewBox="0 0 ${W} ${y}" font-family="Helvetica, Arial, sans-serif" role="img" aria-labelledby="ttl dsc">\n<title id="ttl">Reporte de gastos y utilidad — ${esc(opts.patio)}</title>\n<desc id="dsc">${esc(opts.period)}: ingresos ${usd(s.incomeCents)}, gastos ${usd(s.expenseCents)}, utilidad real ${usd(s.netCents)}.</desc>\n<rect width="${W}" height="${y}" fill="#ffffff"/>\n${out.join("\n")}\n</svg>\n`;
}

function wrap(text: string, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}
