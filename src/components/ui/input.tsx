import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const control =
  "w-full min-w-0 rounded-none border border-line bg-card px-3.5 text-[15px] text-fg transition placeholder:text-mut/70 focus-visible:border-fg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-fg disabled:cursor-not-allowed disabled:opacity-50";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input ref={ref} type={type} className={cn(control, "h-11", type === "color" && "cursor-pointer p-1", type === "file" && "h-auto cursor-pointer py-2 file:mr-3 file:rounded-md file:border-0 file:bg-alt file:px-3 file:py-1.5 file:text-sm file:text-fg", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(control, "min-h-[96px] resize-y py-2.5", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { wrapperClassName?: string }>(
  ({ className, wrapperClassName, children, ...props }, ref) => (
    <div className={cn("relative min-w-0", wrapperClassName)}>
      <select ref={ref} className={cn(control, "h-11 cursor-pointer appearance-none pr-9", className)} {...props}>
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-mut" />
    </div>
  ),
);
Select.displayName = "Select";

/** Etiqueta + control (reemplaza al antiguo .lbl). */
export function Field({ label, className, children }: { label: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("flex min-w-0 flex-col gap-1.5 text-sm text-mut", className)}>
      {label}
      {children}
    </label>
  );
}

export function Check({ className, children, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { children: React.ReactNode }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px] text-fg", className)}>
      <input type="checkbox" className="size-[18px] accent-[rgb(var(--fg))]" {...props} />
      {children}
    </label>
  );
}
