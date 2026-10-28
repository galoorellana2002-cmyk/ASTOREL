/** Franja de la hoja del parabrisas: barras de tinta y papel. */
export function Stripe({ className = "h-14" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`flex overflow-hidden ${className}`}>
      {Array.from({ length: 64 }, (_, i) => (
        <span key={i} className={`w-7 shrink-0 ${i % 2 ? "bg-white" : "bg-black"}`} />
      ))}
    </div>
  );
}
