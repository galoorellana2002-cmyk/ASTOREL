import Link from "next/link";
import { CATEGORY_LABEL } from "@/lib/constants";
import { loadFinance, parsePeriod, PERIODS } from "@/lib/financeData";
import { usd } from "@/lib/finance";
import { MovementForm } from "@/components/admin/MovementForm";
import { FinanceAssistant } from "@/components/admin/FinanceAssistant";
import { deleteMovement } from "../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export const dynamic = "force-dynamic";

export default async function FinancePage({ searchParams }: { searchParams: { period?: string; ok?: string } }) {
  const period = parsePeriod(searchParams.period);
  const { summary: s, movements, vehicles } = await loadFinance(period);
  const label = new Map(vehicles.map((v) => [v.id, v.label]));
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Guayaquil" });
  const maxCat = Math.max(1, ...s.expensesByCategory.map((c) => c.cents));
  const maxMonth = Math.max(1, ...s.byMonth.map((m) => Math.max(m.income, m.expense)));
  const tone = (c: number) => (c < 0 ? "neg" : "pos");

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Finanzas</h1>
          <p className="adm-sub">Ingresos, gastos, ganancias y pérdidas del patio.</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a className="btn sm" href={`/admin/export/svg?period=${period}`} download>Descargar reporte SVG</a>
          <a className="btn sm out" href={`/admin/export/csv?period=${period}`} download>Exportar CSV</a>
        </div>
      </div>

      <nav className="chips-row" aria-label="Periodo" style={{ marginBottom: 18 }}>
        {PERIODS.map((p) => (
          <Link key={p.id} href={`/admin/finance?period=${p.id}`} aria-current={p.id === period ? "true" : undefined}>{p.label}</Link>
        ))}
      </nav>

      <div className="stat-cards">
        <div className="stat-card"><b>{usd(s.incomeCents)}</b><span>Ingresos</span><small>Ventas y otros cobros</small></div>
        <div className="stat-card"><b>{usd(s.expenseCents)}</b><span>Gastos totales</span><small>Incluye compra de autos</small></div>
        <div className="stat-card"><b className={tone(s.cashCents)}>{usd(s.cashCents)}</b><span>Flujo de caja</span><small>Ingresos − gastos</small></div>
        <div className="stat-card"><b className={tone(s.netCents)}>{usd(s.netCents)}</b><span>{s.netCents < 0 ? "Pérdida real" : "Utilidad real"}</span><small>{s.marginPct === null ? "Sin ventas completas aún" : `${s.marginPct.toFixed(1)}% sobre ventas`}</small></div>
      </div>
      <p className="small" style={{ margin: "-10px 0 22px" }}>
        Utilidad real = utilidad de autos vendidos ({usd(s.salesProfitCents)}) − gastos generales ({usd(s.operatingCents)}). Dinero invertido en autos sin vender: {usd(s.stockCents)} (no es pérdida).
      </p>

      <div className="panel">
        <h2>Asistente financiero (IA)</h2>
        <ul className="fin-insights">{s.insights.map((i) => <li key={i}>{i}</li>)}</ul>
        <FinanceAssistant period={period} />
      </div>

      <div className="two-col">
        <div className="panel">
          <h2>Gastos por categoría</h2>
          <div className="segbars">
            {s.expensesByCategory.map((c) => (
              <div key={c.category} className="segbar fin-cat">
                <span>{c.label}</span>
                <i style={{ width: `${Math.max(2, (c.cents / maxCat) * 100)}%` }} />
                <b>{usd(c.cents)}</b>
              </div>
            ))}
            {!s.expensesByCategory.length && <p className="small">Sin gastos en este periodo.</p>}
          </div>
        </div>
        <div className="panel">
          <h2>Por mes</h2>
          <div className="segbars">
            {s.byMonth.map((m) => (
              <div key={m.key} className="fin-month">
                <span>{m.label}</span>
                <div className="bars"><i style={{ width: `${(m.income / maxMonth) * 100}%`, background: "var(--ok)" }} /><i style={{ width: `${(m.expense / maxMonth) * 100}%` }} /></div>
                <small>{usd(m.income)} / {usd(m.expense)}</small>
              </div>
            ))}
            {!s.byMonth.length && <p className="small">Sin movimientos.</p>}
            {!!s.byMonth.length && <p className="small">Verde: ingresos · Negro: gastos</p>}
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>Resultado por auto</h2>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Auto</th><th>Costo total</th><th>Venta</th><th>Utilidad</th></tr></thead>
            <tbody>
              {s.vehicles.map((v) => (
                <tr key={v.vehicleId}>
                  <td>{v.label}</td>
                  <td>{usd(v.costCents)}</td>
                  <td>{v.revenueCents ? usd(v.revenueCents) : "—"}</td>
                  <td className={v.profitCents === null ? "" : tone(v.profitCents)}>{v.profitCents === null ? (v.missingCost ? "Falta registrar la compra" : "Sin vender") : usd(v.profitCents)}</td>
                </tr>
              ))}
              {!s.vehicles.length && <tr><td colSpan={4} className="small">Registra la compra de un auto eligiéndolo en el formulario de abajo.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel">
        <h2>Registrar movimiento</h2>
        {searchParams.ok && <p className="small" role="status" style={{ marginBottom: 10 }}>Movimiento guardado.</p>}
        <MovementForm vehicles={vehicles} today={today} />
        <p className="small" style={{ marginTop: 10 }}>Al registrar la venta de un auto, queda marcado como vendido en la tienda.</p>
      </div>

      <div className="panel">
        <h2>Movimientos</h2>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Fecha</th><th>Categoría</th><th>Auto</th><th>Detalle</th><th>Monto</th><th></th></tr></thead>
            <tbody>
              {movements.slice(0, 200).map((m) => (
                <tr key={m.id}>
                  <td>{m.date.toISOString().slice(0, 10)}</td>
                  <td>{CATEGORY_LABEL[m.category] ?? m.category}</td>
                  <td>{m.vehicleId ? label.get(m.vehicleId) ?? "—" : "General"}</td>
                  <td>{m.description || "—"}</td>
                  <td className={m.type === "INGRESO" ? "pos" : ""}>{m.type === "INGRESO" ? "+" : "−"}{usd(m.amountCents)}</td>
                  <td>
                    <form action={deleteMovement}>
                      <input type="hidden" name="id" value={m.id} />
                      <ConfirmButton message="¿Eliminar este movimiento?" className="btn sm out">Eliminar</ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
              {!movements.length && <tr><td colSpan={6} className="small">Aún no hay movimientos en este periodo.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
