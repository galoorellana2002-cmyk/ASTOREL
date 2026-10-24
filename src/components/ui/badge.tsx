import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[13px] leading-5", {
  variants: {
    tone: {
      neutral: "border-transparent bg-fg/8 text-fg",
      ok: "border-transparent bg-ok/12 text-ok",
      warn: "border-transparent bg-warn/12 text-warn",
      bad: "border-transparent bg-bad/12 text-bad",
      outline: "border-line bg-transparent text-mut",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export function Badge({ className, tone, ...props }: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

type Tone = "neutral" | "ok" | "warn" | "bad" | "outline";
const TONES: Record<string, Tone> = {
  MIRON: "neutral",
  PREGUNTON: "neutral",
  NEGOCIANTE: "warn",
  CLIENTE_FINAL: "ok",
  AVAILABLE: "ok",
  CONFIRMADA: "ok",
  RESERVED: "warn",
  PENDIENTE: "warn",
  SOLD: "neutral",
  CANCELADA: "neutral",
};

/** Insignia de estado/segmento: el color depende de la clave (MIRON, AVAILABLE, PENDIENTE…). */
export function Pill({ k, children }: { k: string; children: React.ReactNode }) {
  return <Badge tone={TONES[k] ?? "neutral"}>{children}</Badge>;
}

/** Punto de estado (verde/ámbar/rojo). */
export function Dot({ tone = "neutral", className }: { tone?: "ok" | "warn" | "bad" | "neutral"; className?: string }) {
  return <i aria-hidden="true" className={cn("inline-block size-[7px] shrink-0 rounded-full", tone === "ok" && "bg-ok", tone === "warn" && "bg-warn", tone === "bad" && "bg-bad", tone === "neutral" && "bg-mut", className)} />;
}
