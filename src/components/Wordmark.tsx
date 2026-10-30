import { cn } from "@/lib/utils";

/** Logo ASTOREL real (SVG de marca) pintado con el color de texto: sirve en claro, oscuro y sobre negro. */
export function Wordmark({ className, name = "ASTOREL" }: { className?: string; name?: string }) {
  return (
    <span
      role="img"
      aria-label={name}
      className={cn("inline-block aspect-[1349/215] h-4 shrink-0 bg-current align-middle", className)}
      style={{
        WebkitMask: "url(/brand/logo-astorel-negro.svg) center / contain no-repeat",
        mask: "url(/brand/logo-astorel-negro.svg) center / contain no-repeat",
      }}
    />
  );
}
