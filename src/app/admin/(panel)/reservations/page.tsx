import { db } from "@/lib/db";
import Link from "next/link";
import { dateTime, money } from "@/lib/format";
import { setReservationStatus } from "../../actions";

export default async function ReservationsPage() {
  const rows = await db.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { vehicle: { select: { brand: true, model: true, year: true, priceCents: true } }, lead: { select: { id: true, name: true, phone: true } } },
  });
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Reservas</h1>
          <p className="adm-sub">Confirmar una reserva marca el auto como reservado en la tienda.</p>
        </div>
      </div>
      <div className="panel">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Fecha</th><th>Auto</th><th>Cliente</th><th>Comentario</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{dateTime(r.createdAt)}</td>
                  <td>{r.vehicle.brand} {r.vehicle.model} {r.vehicle.year}<div className="small">{money(r.vehicle.priceCents)}</div></td>
                  <td><Link className="row-link" href={`/admin/leads/${r.lead.id}`}>{r.lead.name ?? "Sin nombre"}</Link><div className="small">{r.lead.phone}</div></td>
                  <td>{r.note || "—"}</td>
                  <td><span className={`pill ${r.status}`}>{r.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      {r.status !== "CONFIRMADA" && (
                        <form action={setReservationStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="CONFIRMADA" /><button className="btn sm" type="submit">Confirmar</button></form>
                      )}
                      {r.status !== "CANCELADA" && (
                        <form action={setReservationStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="CANCELADA" /><button className="btn sm out" type="submit">Cancelar</button></form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && <tr><td colSpan={6} className="small">Aún no hay reservas.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
