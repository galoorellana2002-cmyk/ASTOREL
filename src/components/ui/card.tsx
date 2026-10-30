import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-none border border-hair bg-card", className)} {...props} />;
}

/** Bloque de panel del admin con título. */
export function Panel({ title, action, className, children }: { title?: React.ReactNode; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-none border border-hair bg-card p-5 sm:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg tracking-tight">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
