"use client";

import { useFormState, useFormStatus } from "react-dom";
import { login, type FormState } from "@/app/admin/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? "Ingresando…" : "Ingresar"}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState<FormState, FormData>(login, {});
  return (
    <form className="login-card" action={action}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/monograma-astorel.svg" alt="ASTOREL" width={48} height={48} style={{ borderRadius: 10, marginBottom: 14 }} />
      <h1>Panel del patio</h1>
      <label className="lbl">
        Correo
        <input className="field" type="email" name="email" required autoComplete="username" />
      </label>
      <label className="lbl">
        Contraseña
        <input className="field" type="password" name="password" required autoComplete="current-password" />
      </label>
      {state.error && <p className="msg-err" role="alert">{state.error}</p>}
      <Submit />
    </form>
  );
}
