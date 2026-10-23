import { getAdmin } from "@/lib/auth";
import { CATEGORY_LABEL } from "@/lib/constants";
import { loadFinance, parsePeriod, periodLabel } from "@/lib/financeData";
import { buildFinanceSvg } from "@/lib/financeSvg";
import { PATIO_NAME } from "@/lib/format";

export const dynamic = "force-dynamic";

const csvCell = (v: string) => {
  // Evita inyección de fórmulas al abrir en Excel.
  const safe = /^[=+\-@]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
};

export async function GET(req: Request, { params }: { params: { format: string } }) {
  if (!(await getAdmin())) return new Response("No autorizado", { status: 401 });
  const period = parsePeriod(new URL(req.url).searchParams.get("period"));
  const { summary, movements, vehicles } = await loadFinance(period);
  const stamp = new Date().toISOString().slice(0, 10);

  if (params.format === "svg") {
    const svg = buildFinanceSvg(summary, {
      patio: PATIO_NAME,
      period: periodLabel(period),
      generated: new Date().toLocaleDateString("es-EC", { timeZone: "America/Guayaquil" }),
    });
    return new Response(svg, {
      headers: {
        "content-type": "image/svg+xml; charset=utf-8",
        "content-disposition": `attachment; filename="reporte-gastos-${stamp}.svg"`,
        "cache-control": "no-store",
        "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'",
      },
    });
  }

  if (params.format === "csv") {
    const label = new Map(vehicles.map((v) => [v.id, v.label]));
    const rows = [["Fecha", "Tipo", "Categoría", "Monto USD", "Auto", "Descripción"].map(csvCell).join(",")];
    for (const m of movements) {
      rows.push([
        m.date.toISOString().slice(0, 10), m.type, CATEGORY_LABEL[m.category] ?? m.category,
        (m.amountCents / 100).toFixed(2), m.vehicleId ? label.get(m.vehicleId) ?? "" : "", m.description,
      ].map(csvCell).join(","));
    }
    return new Response("﻿" + rows.join("\r\n"), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="movimientos-${stamp}.csv"`,
        "cache-control": "no-store",
      },
    });
  }
  return new Response("Formato no válido", { status: 404 });
}
