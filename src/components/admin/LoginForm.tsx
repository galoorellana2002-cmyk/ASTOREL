"use client";

import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { login, type FormState } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-1 w-full">
      {pending ? "Ingresando…" : "Ingresar"}
    </Button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState<FormState, FormData>(login, {});
  return (
    <motion.form
      action={action}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className="relative flex w-full max-w-[400px] flex-col gap-4 rounded-3xl border border-hair bg-card p-8 shadow-lift"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/monograma-astorel.svg" alt="ASTOREL" width={48} height={48} className="mb-1 rounded-[10px]" />
      <h1 className="text-[28px] tracking-tightest">Panel del patio</h1>
      <Field label="Correo">
        <Input type="email" name="email" required autoComplete="username" />
      </Field>
      <Field label="Contraseña">
        <Input type="password" name="password" required autoComplete="current-password" />
      </Field>
      {state?.error && (
        <p role="alert" className="rounded-none bg-bad/10 px-3.5 py-2.5 text-[15px] text-bad">
          {state.error}
        </p>
      )}
      <Submit />
    </motion.form>
  );
}
