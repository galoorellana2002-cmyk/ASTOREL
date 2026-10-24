import Link from "next/link";
import * as React from "react";
import { cn } from "@/lib/utils";

/** Encabezado de página del panel: título, subtítulo y acción opcional. */
export function AdminHead({ title, sub, action, back }: { title: React.ReactNode; sub?: React.ReactNode; action?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <p className="mb-1.5 text-[13px] text-mut">
            <Link href={back.href} className="transition hover:text-fg hover:underline">{back.label}</Link>
          </p>
        )}
        <h1 className="text-[clamp(26px,3.2vw,36px)] leading-tight tracking-tightest">{title}</h1>
        {sub && <p className="mt-1 text-[15px] text-mut">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ value, label, hint, tone }: { value: React.ReactNode; label: string; hint?: React.ReactNode; tone?: "pos" | "neg" }) {
  return (
    <div className="rounded-2xl border border-hair bg-card p-5 shadow-soft">
      <b className={cn("block break-words text-[clamp(28px,3vw,38px)] leading-[1.1] tracking-tightest tabular-nums", tone === "pos" && "text-ok", tone === "neg" && "text-bad")}>{value}</b>
      <span className="mt-1 block text-sm text-mut">{label}</span>
      {hint && <small className="mt-1.5 block text-xs leading-snug text-mut">{hint}</small>}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="mb-7 grid grid-cols-[repeat(auto-fit,minmax(min(100%,210px),1fr))] gap-3.5">{children}</div>;
}

export function Flash({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="mb-4 rounded-xl bg-ok/12 px-3.5 py-2.5 text-[15px] text-ok">
      {children}
    </p>
  );
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="rounded-xl bg-bad/10 px-3.5 py-2.5 text-[15px] text-bad">
      {children}
    </p>
  );
}

/** Fila de chips-filtro (enlaces). */
export function ChipRow({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mb-5 flex flex-wrap gap-2", className)}>{children}</div>;
}

export function ChipLink({ href, active, children }: { href: string; active?: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "true" : undefined} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition", active ? "border-fg bg-fg text-bg" : "border-line bg-card text-fg hover:border-fg")}>
      {children}
    </Link>
  );
}

export function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="mb-5 grid grid-cols-1 items-start gap-5 lg:grid-cols-2">{children}</div>;
}

export function Stack({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("flex min-w-0 flex-col gap-5", className)}>{children}</div>;
}

export function BarRow({ label, value, pct, className, color }: { label: React.ReactNode; value: React.ReactNode; pct: number; className?: string; color?: string }) {
  return (
    <div className={cn("grid grid-cols-[minmax(90px,130px)_1fr_auto] items-center gap-2.5 text-sm", className)}>
      <span className="truncate">{label}</span>
      <i className="block h-2 min-w-[2px] rounded bg-fg/85" style={{ width: `${pct}%`, ...(color ? { background: color } : null) }} />
      <b className="tabular-nums">{value}</b>
    </div>
  );
}
