import Link from "next/link";
import { CATEGORY_LABEL } from "@/lib/constants";
import { loadFinance, parsePeriod, PERIODS } from "@/lib/financeData";
import { usd } from "@/lib/finance";
import { MovementForm } from "@/components/admin/MovementForm";
import { FinanceAssistant } from "@/components/admin/FinanceAssistant";
import { deleteMovement } from "../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Small, Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AdminHead, BarRow, ChipLink, ChipRow, StatCard, StatGrid, TwoCol } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function FinancePage({ searchParams }: { searchParams: { period?: string; ok?: string } }) {
  const period = parsePeriod(searchParams.period);
  const { summary: s, movements, vehicles } = await loadFinance(period);
  const label = new Map(vehicles.map((v) => [v.id, v.label]));
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Guayaquil" });
  const maxCat = Math.max(1, ...s.expensesByCategory.map((c) => c.cents));
  const maxMonth = Math.max(1, ...s.byMonth.map((m) => Math.max(m.income, m.expense)));
  const tone = (c: number) => (c < 0 ? ("neg" as const) : ("pos" as const));

  return (
    <>
      <AdminHead
        title="Finanzas"
        sub="Ingresos, gastos, ganancias y pérdidas del patio."
        action={
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm"><a href={`/admin/export/svg?period=${period}`} download><Download aria-hidden="true" />Descargar reporte SVG</a></Button>
            <Button asChild size="sm" variant="outline"><a href={`/admin/export/csv?period=${period}`} download>Exportar CSV</a></Button>
          </div>
        }
      />

      <ChipRow className="mb-[18px]">
        {PERIODS.map((p) => (
          <ChipLink key={p.id} href={`/admin/finance?period=${p.id}`} active={p.id === period}>{p.label}</ChipLink>
        ))}
      </ChipRow>

      <StatGrid>
        <StatCard value={usd(s.incomeCents)} label="Ingresos" hint="Ventas y otros cobros" />
        <StatCard value={usd(s.expenseCents)} label="Gastos totales" hint="Incluye compra de autos" />
        <StatCard value={usd(s.cashCents)} tone={tone(s.cashCents)} label="Flujo de caja" hint="Ingresos − gastos" />
        <StatCard value={usd(s.netCents)} tone={tone(s.netCents)} label={s.netCents < 0 ? "Pérdida real" : "Utilidad real"} hint={s.marginPct === null ? "Sin ventas completas aún" : `${s.marginPct.toFixed(1)}% sobre ventas`} />
      </StatGrid>
      <p className="-mt-3.5 mb-6 text-[13px] text-mut">
        Utilidad real = utilidad de autos vendidos ({usd(s.salesProfitCents)}) − gastos generales ({usd(s.operatingCents)}). Dinero invertido en autos sin vender: {usd(s.stockCents)} (no es pérdida).
      </p>

      <Panel title="Asistente financiero (IA)" className="mb-5">
        <ul className="m-0 mb-4 flex list-disc flex-col gap-1.5 pl-[18px] text-[15px] leading-snug">{s.insights.map((i) => <li key={i}>{i}</li>)}</ul>
        <FinanceAssistant period={period} />
      </Panel>

      <TwoCol>
        <Panel title="Gastos por categoría">
          <div className="flex flex-col gap-2.5">
            {s.expensesByCategory.map((c) => (
              <BarRow key={c.category} label={c.label} value={usd(c.cents)} pct={Math.max(2, (c.cents / maxCat) * 100)} />
            ))}
            {!s.expensesByCategory.length && <Small>Sin gastos en este periodo.</Small>}
          </div>
        </Panel>
        <Panel title="Por mes">
          <div className="flex flex-col gap-2.5">
            {s.byMonth.map((m) => (
              <div key={m.key} className="grid grid-cols-[54px_1fr_auto] items-center gap-2.5 text-sm">
                <span>{m.label}</span>
                <div className="flex flex-col gap-[3px]">
                  <i className="block h-[7px] min-w-[2px] rounded bg-ok" style={{ width: `${(m.income / maxMonth) * 100}%` }} />
                  <i className="block h-[7px] min-w-[2px] rounded bg-fg" style={{ width: `${(m.expense / maxMonth) * 100}%` }} />
                </div>
                <small className="whitespace-nowrap text-xs text-mut">{usd(m.income)} / {usd(m.expense)}</small>
              </div>
            ))}
            {!s.byMonth.length && <Small>Sin movimientos.</Small>}
            {!!s.byMonth.length && <Small>Verde: ingresos · Negro: gastos</Small>}
          </div>
        </Panel>
      </TwoCol>

      <Panel title="Resultado por auto" className="mb-5">
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Auto</TH><TH>Costo total</TH><TH>Venta</TH><TH>Utilidad</TH></TR></THead>
          <TBody>
            {s.vehicles.map((v) => (
              <TR key={v.vehicleId}>
                <TD>{v.label}</TD>
                <TD>{usd(v.costCents)}</TD>
                <TD>{v.revenueCents ? usd(v.revenueCents) : "—"}</TD>
                <TD className={cn(v.profitCents !== null && (tone(v.profitCents) === "neg" ? "text-bad" : "text-ok"))}>{v.profitCents === null ? (v.missingCost ? "Falta registrar la compra" : "Sin vender") : usd(v.profitCents)}</TD>
              </TR>
            ))}
            {!s.vehicles.length && <TR><TD colSpan={4}><Small>Registra la compra de un auto eligiéndolo en el formulario de abajo.</Small></TD></TR>}
          </TBody>
        </Table>
      </Panel>

      <Panel title="Registrar movimiento" className="mb-5">
        {searchParams.ok && <p role="status" className="mb-2.5 text-[13px] text-ok">Movimiento guardado.</p>}
        <MovementForm vehicles={vehicles} today={today} />
        <Small className="mt-2.5">Al registrar la venta de un auto, queda marcado como vendido en la tienda.</Small>
      </Panel>

      <Panel title="Movimientos">
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Fecha</TH><TH>Categoría</TH><TH>Auto</TH><TH>Detalle</TH><TH>Monto</TH><TH /></TR></THead>
          <TBody>
            {movements.slice(0, 200).map((m) => (
              <TR key={m.id}>
                <TD>{m.date.toISOString().slice(0, 10)}</TD>
                <TD>{CATEGORY_LABEL[m.category] ?? m.category}</TD>
                <TD>{m.vehicleId ? label.get(m.vehicleId) ?? "—" : "General"}</TD>
                <TD>{m.description || "—"}</TD>
                <TD className={cn("whitespace-nowrap tabular-nums", m.type === "INGRESO" && "text-ok")}>{m.type === "INGRESO" ? "+" : "−"}{usd(m.amountCents)}</TD>
                <TD>
                  <form action={deleteMovement}>
                    <input type="hidden" name="id" value={m.id} />
                    <ConfirmButton variant="outline" message="¿Eliminar este movimiento?">Eliminar</ConfirmButton>
                  </form>
                </TD>
              </TR>
            ))}
            {!movements.length && <TR><TD colSpan={6}><Small>Aún no hay movimientos en este periodo.</Small></TD></TR>}
          </TBody>
        </Table>
      </Panel>
    </>
  );
}
