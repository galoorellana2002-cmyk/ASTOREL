import Link from "next/link";
import { db } from "@/lib/db";
import { dateTime, money } from "@/lib/format";
import { setReservationStatus } from "../../actions";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Pill } from "@/components/ui/badge";
import { Small, Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AdminHead } from "@/components/admin/ui";

export default async function ReservationsPage() {
  const rows = await db.reservation.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { vehicle: { select: { brand: true, model: true, year: true, priceCents: true } }, lead: { select: { id: true, name: true, phone: true } } },
  });
  return (
    <>
      <AdminHead title="Reservas" sub="Confirmar una reserva marca el auto como reservado en la tienda." />
      <Panel>
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Fecha</TH><TH>Auto</TH><TH>Cliente</TH><TH>Comentario</TH><TH>Estado</TH><TH /></TR></THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.id}>
                <TD>{dateTime(r.createdAt)}</TD>
                <TD>{r.vehicle.brand} {r.vehicle.model} {r.vehicle.year}<Small>{money(r.vehicle.priceCents)}</Small></TD>
                <TD><Link className="inline-block py-1 hover:underline" href={`/admin/leads/${r.lead.id}`}>{r.lead.name ?? "Sin nombre"}</Link><Small>{r.lead.phone}</Small></TD>
                <TD>{r.note || "—"}</TD>
                <TD><Pill k={r.status}>{r.status}</Pill></TD>
                <TD>
                  <div className="flex gap-1.5">
                    {r.status !== "CONFIRMADA" && (
                      <form action={setReservationStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="CONFIRMADA" /><Button size="sm" type="submit">Confirmar</Button></form>
                    )}
                    {r.status !== "CANCELADA" && (
                      <form action={setReservationStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="CANCELADA" /><Button size="sm" variant="outline" type="submit">Cancelar</Button></form>
                    )}
                  </div>
                </TD>
              </TR>
            ))}
            {!rows.length && <TR><TD colSpan={6}><Small>Aún no hay reservas.</Small></TD></TR>}
          </TBody>
        </Table>
      </Panel>
    </>
  );
}
