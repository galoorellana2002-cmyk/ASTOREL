import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseReasons } from "@/lib/leads";
import { LEAD_STATUS, LEAD_STATUS_LABEL, SEGMENTS, SEGMENT_HINT, SEGMENT_LABEL, type Segment } from "@/lib/constants";
import { dateTime, waLink } from "@/lib/format";
import { deleteLead, updateLead } from "../../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Pill } from "@/components/ui/badge";
import { Check, Field, Select, Textarea } from "@/components/ui/input";
import { Small } from "@/components/ui/table";
import { AdminHead, Stack, TwoCol } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const lead = await db.lead.findUnique({
    where: { id: params.id },
    include: {
      vehicle: { select: { id: true, brand: true, model: true, year: true } },
      sessions: { include: { messages: { orderBy: { createdAt: "asc" } } }, orderBy: { createdAt: "asc" } },
      reservations: { include: { vehicle: { select: { brand: true, model: true, year: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!lead) notFound();
  const messages = lead.sessions.flatMap((s) => s.messages);
  const reasons = parseReasons(lead.reasons);
  const seg = lead.segment as Segment;
  const phoneIntl = lead.phone ? "593" + lead.phone.replace(/^0/, "") : null;

  return (
    <>
      <AdminHead
        back={{ href: "/admin/leads", label: "← Clientes" }}
        title={lead.name ?? "Visitante anónimo"}
        sub={
          <span className="inline-flex flex-wrap items-center gap-2">
            <Pill k={lead.segment}>{SEGMENT_LABEL[seg] ?? lead.segment}</Pill> {SEGMENT_HINT[seg]}
          </span>
        }
        action={
          phoneIntl && (
            <Button asChild size="sm">
              <a target="_blank" rel="noopener noreferrer" href={`https://wa.me/${phoneIntl}?text=${encodeURIComponent("Hola, te escribimos del patio. ¿En qué auto estás interesado?")}`}>
                <MessageCircle aria-hidden="true" />
                Escribir por WhatsApp
              </a>
            </Button>
          )
        }
      />

      <TwoCol>
        <Stack>
          <Panel title="Por qué está en este grupo">
            {reasons.length ? (
              <ul className="m-0 flex list-disc flex-col gap-1 pl-[18px] text-[15px] text-mut">{reasons.map((r) => <li key={r}>{r}</li>)}</ul>
            ) : (
              <Small>Todavía no hay señales.</Small>
            )}
            <Small className="mt-3">Puntaje {lead.score} · {lead.vehiclesViewed} autos vistos · {lead.viewerOpens} aperturas del visor 3D</Small>
          </Panel>
          <Panel title="Conversación">
            <div className="flex max-h-[420px] flex-col gap-2 overflow-y-auto p-1">
              {messages.length ? (
                messages.map((m) => (
                  <div
                    key={m.id}
                    title={dateTime(m.createdAt)}
                    className={cn("max-w-[86%] whitespace-pre-wrap break-words rounded-none px-3.5 py-2.5 text-[15px] leading-snug", m.role === "bot" ? "self-start rounded-bl-sm border border-hair bg-alt" : "self-end rounded-br-sm bg-inv text-inv-fg")}
                  >
                    {m.content}
                  </div>
                ))
              ) : (
                <Small>No escribió en el chat.</Small>
              )}
            </div>
          </Panel>
          {lead.reservations.length > 0 && (
            <Panel title="Reservas">
              <ul className="m-0 list-none p-0">
                {lead.reservations.map((r) => (
                  <li key={r.id} className="flex items-baseline gap-2.5 border-t border-hair py-[11px] text-[15px] first:border-t-0">
                    {r.vehicle.brand} {r.vehicle.model} {r.vehicle.year}
                    <span className="ml-auto"><Pill k={r.status}>{r.status}</Pill></span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </Stack>

        <Stack>
          <Panel title="Contacto">
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
              <dt className="text-mut">Teléfono</dt><dd className="m-0 break-words">{lead.phone ?? "—"}</dd>
              <dt className="text-mut">Correo</dt><dd className="m-0 break-words">{lead.email ?? "—"}</dd>
              <dt className="text-mut">Origen</dt><dd className="m-0">{lead.source === "CHAT" ? "Chat" : "Formulario de reserva"}</dd>
              <dt className="text-mut">Interés</dt><dd className="m-0">{lead.vehicle ? `${lead.vehicle.brand} ${lead.vehicle.model} ${lead.vehicle.year}` : "—"}</dd>
              <dt className="text-mut">Creado</dt><dd className="m-0">{dateTime(lead.createdAt)}</dd>
            </dl>
          </Panel>
          <form action={updateLead}>
            <Panel title="Gestión" className="flex flex-col">
              <div className="flex flex-col gap-3">
                <input type="hidden" name="id" value={lead.id} />
                <Field label="Tipo de cliente">
                  <Select name="segment" defaultValue={lead.segment}>{SEGMENTS.map((s) => <option key={s} value={s}>{SEGMENT_LABEL[s]}</option>)}</Select>
                </Field>
                <Check name="segmentLocked" defaultChecked={lead.segmentLocked}>Fijar este tipo (el sistema no lo recalcula)</Check>
                <Field label="Seguimiento">
                  <Select name="status" defaultValue={lead.status}>{LEAD_STATUS.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>)}</Select>
                </Field>
                <Field label="Notas">
                  <Textarea name="notes" defaultValue={lead.notes} maxLength={2000} rows={4} />
                </Field>
                <div><Button size="sm" type="submit">Guardar</Button></div>
              </div>
            </Panel>
          </form>
          <form action={deleteLead}>
            <input type="hidden" name="id" value={lead.id} />
            <ConfirmButton message="¿Eliminar este cliente y su conversación?">Eliminar cliente</ConfirmButton>
          </form>
        </Stack>
      </TwoCol>
    </>
  );
}
