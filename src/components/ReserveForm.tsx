"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createReservation, type ReserveState } from "@/app/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? "Enviando…" : "Solicitar reserva"}
    </button>
  );
}

const initial: ReserveState = { ok: false };

export function ReserveForm({ vehicleId }: { vehicleId: string }) {
  const [state, action] = useFormState(createReservation, initial);
  if (state.ok) {
    return (
      <div className="reserve" role="status">
        <p className="done">¡Listo! Recibimos tu solicitud. Un asesor te escribirá por WhatsApp para confirmar.</p>
      </div>
    );
  }
  return (
    <form className="reserve" action={action}>
      <h3>Reservar este auto</h3>
      <p className="small">No se cobra nada ahora. Un asesor te contacta para confirmar la reserva.</p>
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <div className="hp" aria-hidden="true">
        <label>
          No llenar
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="lbl">
        Tu nombre
        <input className="field" name="name" required minLength={2} maxLength={80} autoComplete="name" />
      </label>
      <label className="lbl">
        Tu celular
        <input className="field" name="phone" required inputMode="tel" autoComplete="tel" placeholder="0991234567" />
      </label>
      <label className="lbl">
        Comentario (opcional)
        <textarea className="field" name="note" maxLength={300} rows={2} />
      </label>
      {state.error && (
        <p className="err" role="alert">
          {state.error}
        </p>
      )}
      <Submit />
    </form>
  );
}
