import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { SEGMENTS, SEGMENT_HINT, SEGMENT_LABEL, type Segment } from "@/lib/constants";
import { dateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Pill } from "@/components/ui/badge";
import { Small, Table, TBody, TD, TR } from "@/components/ui/table";
import { AdminHead, BarRow, StatCard, StatGrid, TwoCol } from "@/components/admin/ui";

export default async function DashboardPage() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const [available, reserved, newLeads, pending, grouped, recent] = await Promise.all([
    db.vehicle.count({ where: { status: "AVAILABLE" } }),
    db.vehicle.count({ where: { status: "RESERVED" } }),
    db.lead.count({ where: { createdAt: { gte: weekAgo } } }),
    db.reservation.count({ where: { status: "PENDIENTE" } }),
    db.lead.groupBy({ by: ["segment"], _count: { _all: true } }),
    db.lead.findMany({ orderBy: { updatedAt: "desc" }, take: 6, include: { vehicle: { select: { brand: true, model: true, year: true } } } }),
  ]);
  const counts = new Map(grouped.map((g) => [g.segment, g._count._all]));
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Array.from(counts.values()));

  return (
    <>
      <AdminHead
        title="Resumen"
        sub="Cómo va el patio esta semana."
        action={
          <Button asChild size="sm">
            <Link href="/admin/vehicles/new"><Plus aria-hidden="true" />Agregar auto</Link>
          </Button>
        }
      />

      <StatGrid>
        <StatCard value={available} label="Autos disponibles" hint={`${reserved} reservados`} />
        <StatCard value={newLeads} label="Clientes nuevos (7 días)" hint={`${total} en total`} />
        <StatCard value={pending} label="Reservas por confirmar" hint={<Link href="/admin/reservations" className="inline-flex min-h-6 items-center underline underline-offset-2">Revisar ahora</Link>} />
        <StatCard value={counts.get("CLIENTE_FINAL") ?? 0} label="Clientes finales" hint="Los que quieren comprar: atiéndelos primero." />
      </StatGrid>

      <TwoCol>
        <Panel title="Clientes por tipo">
          <div className="flex flex-col gap-1">
            {SEGMENTS.map((s: Segment) => (
              <Link key={s} href={`/admin/leads?segment=${s}`} title={SEGMENT_HINT[s]} className="-mx-2 rounded-lg px-2 py-1.5 transition hover:bg-fg/5">
                <BarRow className="grid-cols-[110px_1fr_36px]" label={SEGMENT_LABEL[s]} value={counts.get(s) ?? 0} pct={((counts.get(s) ?? 0) / max) * 100} />
              </Link>
            ))}
          </div>
        </Panel>
        <Panel title="Actividad reciente">
          <Table className="min-w-0">
            <TBody>
              {recent.map((l) => (
                <TR key={l.id}>
                  <TD>
                    <Link className="inline-block py-1 hover:underline" href={`/admin/leads/${l.id}`}>{l.name ?? "Visitante anónimo"}</Link>
                    <Small>{l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model} ${l.vehicle.year}` : dateTime(l.updatedAt)}</Small>
                  </TD>
                  <TD className="text-right"><Pill k={l.segment}>{SEGMENT_LABEL[l.segment as Segment] ?? l.segment}</Pill></TD>
                </TR>
              ))}
              {!recent.length && (
                <TR>
                  <TD><Small>Aún no hay clientes. Cuando alguien chatee o reserve, aparece aquí.</Small></TD>
                </TR>
              )}
            </TBody>
          </Table>
        </Panel>
      </TwoCol>
    </>
  );
}
