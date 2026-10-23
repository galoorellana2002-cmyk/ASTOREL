"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addMovement, type FormState } from "@/app/admin/actions";
import { CATEGORY_LABEL, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/constants";

function Submit() {
  const { pending } = useFormStatus();
  return <button className="btn sm" type="submit" disabled={pending}>{pending ? "Guardando…" : "Registrar"}</button>;
}

export function MovementForm({ vehicles, today }: { vehicles: Array<{ id: string; label: string }>; today: string }) {
  const [state, action] = useFormState<FormState, FormData>(addMovement, {});
  const [type, setType] = useState<"GASTO" | "INGRESO">("GASTO");
  const cats = type === "GASTO" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  return (
    <form action={action} className="form-grid">
      <label className="lbl">Tipo
        <select className="field" name="type" value={type} onChange={(e) => setType(e.target.value as "GASTO" | "INGRESO")}>
          <option value="GASTO">Gasto</option>
          <option value="INGRESO">Ingreso</option>
        </select>
      </label>
      <label className="lbl">Categoría
        <select className="field" name="category" key={type}>
          {cats.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
        </select>
      </label>
      <label className="lbl">Monto (USD)
        <input className="field" name="amountUsd" type="number" step="0.01" min="0.01" required inputMode="decimal" />
      </label>
      <label className="lbl">Fecha
        <input className="field" name="date" type="date" defaultValue={today} required />
      </label>
      <label className="lbl">Auto (si aplica)
        <select className="field" name="vehicleId" defaultValue="">
          <option value="">— Gasto general —</option>
          {vehicles.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
        </select>
      </label>
      <label className="lbl">Detalle
        <input className="field" name="description" maxLength={200} placeholder="Ej.: pintura puerta, factura 0012" />
      </label>
      <div style={{ display: "flex", alignItems: "end", gap: 12 }}>
        <Submit />
        {state?.error && <span role="alert" className="small" style={{ color: "var(--bad)" }}>{state?.error}</span>}
      </div>
    </form>
  );
}
