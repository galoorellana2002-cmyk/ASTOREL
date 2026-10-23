import Link from "next/link";
import { db } from "@/lib/db";
import { SEGMENTS, SEGMENT_HINT, SEGMENT_LABEL, type Segment } from "@/lib/constants";
import { dateTime } from "@/lib/format";

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
      <div className="adm-head">
        <div>
          <h1>Resumen</h1>
          <p className="adm-sub">Cómo va el patio esta semana.</p>
        </div>
        <Link className="btn sm" href="/admin/vehicles/new">Agregar auto</Link>
      </div>

      <div className="stat-cards">
        <div className="stat-card"><b>{available}</b><span>Autos disponibles</span><small>{reserved} reservados</small></div>
        <div className="stat-card"><b>{newLeads}</b><span>Clientes nuevos (7 días)</span><small>{total} en total</small></div>
        <div className="stat-card"><b>{pending}</b><span>Reservas por confirmar</span><small><Link href="/admin/reservations" style={{ textDecoration: "underline" }}>Revisar ahora</Link></small></div>
        <div className="stat-card"><b>{counts.get("CLIENTE_FINAL") ?? 0}</b><span>Clientes finales</span><small>Los que quieren comprar: atiéndelos primero.</small></div>
      </div>

      <div className="two-col">
        <div className="panel">
          <h2>Clientes por tipo</h2>
          <div className="segbars">
            {SEGMENTS.map((s: Segment) => (
              <Link key={s} className="segbar" href={`/admin/leads?segment=${s}`} title={SEGMENT_HINT[s]}>
                <span>{SEGMENT_LABEL[s]}</span>
                <i style={{ width: `${((counts.get(s) ?? 0) / max) * 100}%` }} />
                <b style={{ fontWeight: 500 }}>{counts.get(s) ?? 0}</b>
              </Link>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Actividad reciente</h2>
          <div className="tbl-wrap">
            <table className="tbl" style={{ minWidth: 0 }}>
              <tbody>
                {recent.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link className="row-link" href={`/admin/leads/${l.id}`}>{l.name ?? "Visitante anónimo"}</Link>
                      <div className="small">{l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model} ${l.vehicle.year}` : dateTime(l.updatedAt)}</div>
                    </td>
                    <td><span className={`pill ${l.segment}`}>{SEGMENT_LABEL[l.segment as Segment] ?? l.segment}</span></td>
                  </tr>
                ))}
                {!recent.length && <tr><td className="small">Aún no hay clientes. Cuando alguien chatee o reserve, aparece aquí.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
