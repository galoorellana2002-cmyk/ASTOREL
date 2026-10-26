"use client";

import { useFormState, useFormStatus } from "react-dom";
import { CheckCircle2 } from "lucide-react";
import { createReservation, type ReserveState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/input";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Enviando…" : "Solicitar reserva"}
    </Button>
  );
}

const initial: ReserveState = { ok: false };

export function ReserveForm({ vehicleId }: { vehicleId: string }) {
  const [state, action] = useFormState(createReservation, initial);
  if (state.ok) {
    return (
      <div role="status" className="mt-7 flex items-start gap-3 rounded-2xl border border-ok/30 bg-ok/10 p-5 text-ok">
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>¡Listo! Recibimos tu solicitud. Un asesor te escribirá por WhatsApp para confirmar.</p>
      </div>
    );
  }
  return (
    <form action={action} className="mt-7 flex flex-col gap-3 rounded-2xl border border-hair bg-card p-5 shadow-soft">
      <h3 className="text-xl tracking-tight">Reservar este auto</h3>
      <p className="text-[13px] text-mut">No se cobra nada ahora. Un asesor te contacta para confirmar la reserva.</p>
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
        <label>
          No llenar
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <Field label="Tu nombre">
        <Input name="name" required minLength={2} maxLength={80} autoComplete="name" />
      </Field>
      <div className="flex flex-col gap-1.5">
        <Field label="Tu celular">
          <Input name="phone" required inputMode="tel" autoComplete="tel" placeholder="0991234567" aria-describedby="phone-help" />
        </Field>
        <span id="phone-help" className="text-xs text-mut">Solo lo usamos para confirmar tu reserva por WhatsApp.</span>
      </div>
      <Field label="Comentario (opcional)">
        <Textarea name="note" maxLength={300} rows={2} />
      </Field>
      {state.error && (
        <p role="alert" className="text-sm text-bad">
          {state.error}
        </p>
      )}
      <Submit />
    </form>
  );
}
