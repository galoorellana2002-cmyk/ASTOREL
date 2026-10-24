import Link from "next/link";
import { db } from "@/lib/db";
import { LEAD_STATUS_LABEL, SEGMENTS, SEGMENT_LABEL, type LeadStatus, type Segment } from "@/lib/constants";
import { dateTime } from "@/lib/format";
import { Panel } from "@/components/ui/card";
import { Pill } from "@/components/ui/badge";
import { Small, Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AdminHead, ChipLink, ChipRow } from "@/components/admin/ui";

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
      <AdminHead title="Clientes" sub="El chatbot y las reservas los clasifican solos; puedes corregirlos a mano." />
      <ChipRow>
        <ChipLink href="/admin/leads" active={!segment}>Todos ({total})</ChipLink>
        {SEGMENTS.map((s: Segment) => (
          <ChipLink key={s} href={`/admin/leads?segment=${s}`} active={segment === s}>
            {SEGMENT_LABEL[s]} ({counts.get(s) ?? 0})
          </ChipLink>
        ))}
      </ChipRow>
      <Panel>
        <Table>
          <THead><TR className="hover:bg-transparent"><TH>Cliente</TH><TH>Tipo</TH><TH>Puntaje</TH><TH>Interés</TH><TH>Seguimiento</TH><TH>Último contacto</TH></TR></THead>
          <TBody>
            {leads.map((l) => (
              <TR key={l.id}>
                <TD>
                  <Link className="hover:underline" href={`/admin/leads/${l.id}`}>{l.name ?? "Visitante anónimo"}</Link>
                  <Small>{l.phone ?? "Sin teléfono"}</Small>
                </TD>
                <TD><Pill k={l.segment}>{SEGMENT_LABEL[l.segment as Segment] ?? l.segment}</Pill>{l.segmentLocked && <span className="text-[13px] text-mut"> · manual</span>}</TD>
                <TD>{l.score}</TD>
                <TD>{l.vehicle ? `${l.vehicle.brand} ${l.vehicle.model} ${l.vehicle.year}` : "—"}{l._count.reservations > 0 && <Small>{l._count.reservations} reserva(s)</Small>}</TD>
                <TD>{LEAD_STATUS_LABEL[l.status as LeadStatus] ?? l.status}</TD>
                <TD>{dateTime(l.updatedAt)}</TD>
              </TR>
            ))}
            {!leads.length && <TR><TD colSpan={6}><Small>No hay clientes en esta vista.</Small></TD></TR>}
          </TBody>
        </Table>
      </Panel>
    </>
  );
}
