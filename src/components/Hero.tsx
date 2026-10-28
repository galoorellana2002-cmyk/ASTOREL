"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CarArt } from "./CarArt";
import { kmFmt, money } from "@/lib/format";
import type { VehicleCardData } from "@/lib/vehicles";
import { Stripe } from "./Stripe";

const LINKS = [
  { href: "/#visor", label: "Visor 3D" },
  { href: "/#confianza", label: "Ficha legal" },
  { href: "/#contacto", label: "Contacto" },
];

const FALLBACK: Pick<VehicleCardData, "art" | "hex">[] = [
  { art: "sedan", hex: "#d8d9dd" },
  { art: "suv", hex: "#b4b6bc" },
  { art: "pickup", hex: "#9a9ba0" },
];

export function Hero({ vehicles }: { vehicles: VehicleCardData[] }) {
  const reduce = useReducedMotion();
  const shown = vehicles.slice(0, 4);
  const count = shown.length || FALLBACK.length;
  const [idx, setIdx] = useState(0);

  // Fundido lento entre los autos del patio; se detiene con la pestaña oculta o con «reducir movimiento».
  useEffect(() => {
    if (reduce || count < 2) return;
    const id = window.setInterval(() => {
      if (!document.hidden) setIdx((i) => (i + 1) % count);
    }, 6000);
    return () => window.clearInterval(id);
  }, [reduce, count]);

  const v = shown[idx];
  const art = v ?? FALLBACK[idx % FALLBACK.length]!;

  return (
    <header id="top" className="bg-black p-3 text-black">
      <div className="grid gap-3 md:min-h-[clamp(600px,calc(100svh-80px),900px)] md:grid-cols-2">
        <div className="relative flex min-h-[48svh] items-center justify-center overflow-hidden rounded-[20px] bg-[radial-gradient(ellipse_80%_70%_at_50%_58%,#34353b_0%,#0b0b0d_72%)] md:order-2 md:min-h-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={v?.id ?? idx}
              className="absolute inset-0 flex items-center justify-center px-[8%]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            >
              {v?.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.coverUrl} alt={`${v.brand} ${v.model} ${v.year}`} className="absolute inset-0 size-full object-cover" />
              ) : (
                <div className="spin w-full max-w-[640px]">
                  <CarArt type={art.art} hex={art.hex} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          {v && (
            <Link
              href={`/autos/${v.slug}`}
              className="absolute inset-x-4 bottom-4 z-10 flex items-baseline justify-between gap-3 rounded-xl bg-black/75 px-4 py-3 text-[15px] text-white transition hover:bg-black focus-visible:outline-white"
            >
              <span>
                {v.brand} {v.model} {v.year} · {kmFmt(v.km)}
              </span>
              <span className="tabular-nums">{money(v.priceCents)}</span>
            </Link>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative z-10 -mt-9 flex flex-col overflow-hidden rounded-[20px] bg-white md:order-1 md:mt-0"
        >
          <Stripe className="h-10 md:h-14" />
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center md:px-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-astorel-negro.svg" alt="" className="w-[40%] max-w-[200px]" />
            <h1 className="mt-10 max-w-[13ch] text-[clamp(44px,6vw,96px)] leading-[0.98] tracking-tightest">Autos usados, sin letra chica.</h1>
            <p className="mt-6 max-w-[36ch] text-[17px] leading-relaxed">Cada auto del patio con su ficha legal, sus defectos marcados y un recorrido en 3D, antes de que vengas.</p>
            <Button asChild size="lg" className="mt-8 bg-black text-white hover:opacity-100 hover:bg-black/80">
              <Link href="/#autos">Ver los autos del patio</Link>
            </Button>
          </div>
          <nav aria-label="En esta página" className="flex flex-wrap justify-center gap-x-8 gap-y-2 px-6 pb-7 text-[15px]">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="inline-flex min-h-11 items-center underline-offset-[6px] hover:underline">
                {l.label}
              </Link>
            ))}
          </nav>
        </motion.div>
      </div>
    </header>
  );
}
