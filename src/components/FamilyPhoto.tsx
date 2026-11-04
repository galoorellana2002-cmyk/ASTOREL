"use client";

import { useState } from "react";
import { Wordmark } from "@/components/Wordmark";

/**
 * Foto de la familia: pon tu imagen en public/nosotros.jpg (recomendado 1200 × 1500 px, vertical).
 * Mientras no exista, se muestra el logo de la marca.
 */
export function FamilyPhoto({ alt }: { alt: string }) {
  const [missing, setMissing] = useState(false);
  if (missing) {
    return (
      <div className="flex size-full items-center justify-center bg-inv">
        <Wordmark className="h-[clamp(14px,2.2vw,22px)] text-inv-fg" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/nosotros.jpg" alt={alt} loading="lazy" onError={() => setMissing(true)} className="size-full object-cover" />;
}
