import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { parseReasons } from "@/lib/leads";
import { LEAD_STATUS, LEAD_STATUS_LABEL, SEGMENTS, SEGMENT_HINT, SEGMENT_LABEL, type Segment } from "@/lib/constants";
import { dateTime, waLink } from "@/lib/format";
import { deleteLead, updateLead } from "../../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

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
      <div className="adm-head">
        <div>
          <p className="small"><Link href="/admin/leads">← Clientes</Link></p>
          <h1>{lead.name ?? "Visitante anónimo"}</h1>
          <p className="adm-sub"><span className={`pill ${lead.segment}`}>{SEGMENT_LABEL[seg] ?? lead.segment}</span> {SEGMENT_HINT[seg]}</p>
        </div>
        {phoneIntl && (
          <a className="btn sm" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${phoneIntl}?text=${encodeURIComponent("Hola, te escribimos del patio. ¿En qué auto estás interesado?")}`}>Escribir por WhatsApp</a>
        )}
      </div>

      <div className="two-col">
        <div>
          <div className="panel">
            <h2>Por qué está en este grupo</h2>
            {reasons.length ? <ul className="reasons">{reasons.map((r) => <li key={r}>{r}</li>)}</ul> : <p className="small">Todavía no hay señales.</p>}
            <p className="small" style={{ marginTop: 10 }}>Puntaje {lead.score} · {lead.vehiclesViewed} autos vistos · {lead.viewerOpens} aperturas del visor 3D</p>
          </div>
          <div className="panel">
            <h2>Conversación</h2>
            <div className="convo">
              {messages.length ? messages.map((m) => (
                <div key={m.id} className={`msg ${m.role}`} title={dateTime(m.createdAt)}>{m.content}</div>
              )) : <p className="small">No escribió en el chat.</p>}
            </div>
          </div>
          {lead.reservations.length > 0 && (
            <div className="panel">
              <h2>Reservas</h2>
              <ul className="rows">
                {lead.reservations.map((r) => (
                  <li key={r.id}>{r.vehicle.brand} {r.vehicle.model} {r.vehicle.year}<span className="v"><span className={`pill ${r.status}`}>{r.status}</span></span></li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <div className="panel">
            <h2>Contacto</h2>
            <dl className="kv">
              <dt>Teléfono</dt><dd>{lead.phone ?? "—"}</dd>
              <dt>Correo</dt><dd>{lead.email ?? "—"}</dd>
              <dt>Origen</dt><dd>{lead.source === "CHAT" ? "Chat" : "Formulario de reserva"}</dd>
              <dt>Interés</dt><dd>{lead.vehicle ? `${lead.vehicle.brand} ${lead.vehicle.model} ${lead.vehicle.year}` : "—"}</dd>
              <dt>Creado</dt><dd>{dateTime(lead.createdAt)}</dd>
            </dl>
          </div>
          <form className="panel repeat" action={updateLead}>
            <h2>Gestión</h2>
            <input type="hidden" name="id" value={lead.id} />
            <label className="lbl">Tipo de cliente
              <select className="field" name="segment" defaultValue={lead.segment}>{SEGMENTS.map((s) => <option key={s} value={s}>{SEGMENT_LABEL[s]}</option>)}</select>
            </label>
            <label className="check"><input type="checkbox" name="segmentLocked" defaultChecked={lead.segmentLocked} /> Fijar este tipo (el sistema no lo recalcula)</label>
            <label className="lbl">Seguimiento
              <select className="field" name="status" defaultValue={lead.status}>{LEAD_STATUS.map((s) => <option key={s} value={s}>{LEAD_STATUS_LABEL[s]}</option>)}</select>
            </label>
            <label className="lbl">Notas<textarea className="field" name="notes" defaultValue={lead.notes} maxLength={2000} rows={4} /></label>
            <div><button className="btn sm" type="submit">Guardar</button></div>
          </form>
          <form action={deleteLead}>
            <input type="hidden" name="id" value={lead.id} />
            <ConfirmButton className="btn sm danger" message="¿Eliminar este cliente y su conversación?">Eliminar cliente</ConfirmButton>
          </form>
        </div>
      </div>
    </>
  );
}
