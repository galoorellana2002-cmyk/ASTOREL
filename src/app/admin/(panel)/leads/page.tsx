import Link from "next/link";
import { db } from "@/lib/db";
import { LEAD_STATUS_LABEL, SEGMENTS, SEGMENT_LABEL, type LeadStatus, type Segment } from "@/lib/constants";
import { dateTime } from "@/lib/format";

export default async function LeadsPage({ searchParams }: { searchParams: { segment?: string } }) {
  const segment = SEGMENTS.find((s) => s === searchParams.segment);
  const [leads, grouped] = await Promise.all([
    db.lead.findMany({
      where: segment ? { segment } : {},
      orderBy: [{ updatedAt: "desc" }],
      take: 200,
      include: { vehicle: { select: { brand: true, model: true, year: true } }, _count: { select: { reservations: true } } },
    }),
    db.lead.groupBy({ by: ["segment"], _count: { _all: true } }),
  ]);
  const counts = new Map(grouped.map((g) => [g.segment, g._count._all]));
  const total = Array.from(counts.values()).reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Clientes</h1>
          <p className="adm-sub">El chatbot y las reservas los clasifican solos; puedes corregirlos a mano.</p>
        </div>
      </div>
      <div className="chips-row">
        <Link href="/admin/leads" aria-current={!segment}>Todos ({total})</Link>
        {SEGMENTS.map((s: Segment) => (
          <Link key={s} href={`/admin/leads?segment=${s}`} aria-current={segment === s}>
            {SEGMENT_LABEL[s]} ({counts.get(s) ?? 0})
          </Link>
        ))}
      </div>
      <div className="panel">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Cliente</th><th>Tipo</th><th>Puntaje</th><th>Interés</th><th>Seguimiento</th><th>Último contacto</th></tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id}>
                  <td>
                    <Link className="row-link" href={`/admin/leads/${l.id}`}>{l.name ?? "Visitante anónimo"}</Link>
                    <div className="small">{l.phone ?? "Sin teléfono"}</div>
                  </td>
                  <td><span className={`pill ${l.segment}`}>{SEGMENT_LABEL[l.segment as Segment] ?? l.segment}</span>{l.segmentLocked && <span className="small"> · manual</span>}</td>
                  <td>{l.score}</td>
                  <td>{l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model} ${l.vehicle.year}` : "—"}{l._count.reservations > 0 && <div className="small">{l._count.reservations} reserva(s)</div>}</td>
                  <td>{LEAD_STATUS_LABEL[l.status as LeadStatus] ?? l.status}</td>
                  <td>{dateTime(l.updatedAt)}</td>
                </tr>
              ))}
              {!leads.length && <tr><td colSpan={6} className="small">No hay clientes en esta vista.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
