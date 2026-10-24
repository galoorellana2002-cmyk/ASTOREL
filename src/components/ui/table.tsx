import * as React from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <table className={cn("w-full min-w-[560px] border-collapse text-left text-[15px]", className)} {...props} />
    </div>
  );
}
export const THead = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <thead {...p} />;
export const TBody = (p: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody {...p} />;
export function TR({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn("border-t border-hair transition-colors first:border-t-0 hover:bg-fg/[.025]", className)} {...props} />;
}
export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn("whitespace-nowrap px-3 py-2.5 text-xs uppercase tracking-[.08em] text-mut", className)} {...props} />;
}
export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-3 py-3 align-top", className)} {...props} />;
}
export function Small({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-[13px] text-mut", className)} {...props} />;
}
