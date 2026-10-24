"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addMovement, type FormState } from "@/app/admin/actions";
import { CATEGORY_LABEL, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/input";

function Submit() {
  const { pending } = useFormStatus();
  return <Button size="sm" type="submit" disabled={pending}>{pending ? "Guardando…" : "Registrar"}</Button>;
}

export function MovementForm({ vehicles, today }: { vehicles: Array<{ id: string; label: string }>; today: string }) {
  const [state, action] = useFormState<FormState, FormData>(addMovement, {});
  const [type, setType] = useState<"GASTO" | "INGRESO">("GASTO");
  const cats = type === "GASTO" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  return (
    <form action={action} className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5">
      <Field label="Tipo">
        <Select name="type" value={type} onChange={(e) => setType(e.target.value as "GASTO" | "INGRESO")}>
          <option value="GASTO">Gasto</option>
          <option value="INGRESO">Ingreso</option>
        </Select>
      </Field>
      <Field label="Categoría">
        <Select name="category" key={type}>
          {cats.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </Select>
      </Field>
      <Field label="Monto (USD)">
        <Input name="amountUsd" type="number" step="0.01" min="0.01" required inputMode="decimal" />
      </Field>
      <Field label="Fecha">
        <Input name="date" type="date" defaultValue={today} required />
      </Field>
      <Field label="Auto (si aplica)">
        <Select name="vehicleId" defaultValue="">
          <option value="">— Gasto general —</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
        </Select>
      </Field>
      <Field label="Detalle">
        <Input name="description" maxLength={200} placeholder="Ej.: pintura puerta, factura 0012" />
      </Field>
      <div className="flex items-end gap-3">
        <Submit />
        {state?.error && <span role="alert" className="text-[13px] text-bad">{state.error}</span>}
      </div>
    </form>
  );
}
