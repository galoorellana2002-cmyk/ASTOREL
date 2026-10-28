"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CarArt } from "./CarArt";
import { cn } from "@/lib/utils";

const SLIDES = [
  { id: "s1", title: "Primero lo ves en 3D.", sub: "Cada auto del patio, por fuera y por dentro.", cta: "Probar el visor", href: "/autos" },
  { id: "s2", title: "Cada detalle, a la vista.", sub: "Rayones, llantas y tapizados marcados antes de que vengas.", cta: "Ver los autos", href: "/autos" },
  { id: "s3", title: "Ficha legal al día.", sub: "Matrícula, multas y revisión técnica verificadas.", cta: "Cómo funciona", href: "/#confianza" },
];

const BG = [
  "bg-[radial-gradient(ellipse_80%_70%_at_50%_46%,#33343a_0%,#121316_58%,#000_100%)]",
  "bg-[radial-gradient(ellipse_80%_70%_at_50%_46%,#3b3d44_0%,#15161a_58%,#000_100%)]",
  "bg-[radial-gradient(ellipse_90%_80%_at_72%_40%,#3a3b41_0%,#17181c_55%,#000_100%)]",
];

const rise = (i: number) => ({
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.85, delay: 0.2 + i * 0.1, ease: [0.2, 0.7, 0.2, 1] as [number, number, number, number] },
});

const FICHA = [
  ["Matrícula", "Vigente"],
  ["Gravámenes", "Ninguno"],
  ["Multas", "$0"],
  ["Revisión técnica", "Al día"],
];

export function Hero() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = (n: number) => setIdx((n + SLIDES.length) % SLIDES.length);
  const s = SLIDES[idx]!;

  const arrow = "absolute top-[44%] z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-black focus-visible:outline-white md:grid";

  return (
    <header id="top" role="region" aria-roledescription="carrusel" aria-label="Destacados del patio" className="group relative overflow-hidden bg-black text-white">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={s.id}
          className={cn("relative h-[clamp(580px,calc(100svh-56px),860px)] touch-pan-y overflow-hidden max-md:h-[clamp(600px,90svh,780px)]", BG[idx])}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => Math.abs(info.offset.x) > 70 && go(idx + (info.offset.x < 0 ? 1 : -1))}
        >
          {/* velos para que el texto siempre se lea */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[28%] bg-gradient-to-b from-black/70 to-transparent" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[62%] bg-gradient-to-t from-black/90 to-transparent" />

          {idx === 0 && (
            <div className="spin absolute left-1/2 top-[13%] z-0 w-[min(62%,820px)] -translate-x-1/2 max-md:top-[15%] max-md:w-[125%]">
              <motion.div initial={{ opacity: 0, y: 40, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}>
                <CarArt type="sedan" hex="#d8d9dd" />
              </motion.div>
            </div>
          )}
          {idx === 1 && (
            <div className="absolute left-1/2 top-[13%] z-0 w-[min(62%,820px)] -translate-x-1/2 max-md:top-[15%] max-md:w-[125%]">
              <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}>
                <CarArt type="suv" hex="#b4b6bc" dots={[[300, 92], [486, 150], [420, 60]]} />
              </motion.div>
            </div>
          )}
          {idx === 2 && (
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.7, 0.2, 1] }}
              className="absolute right-[max(16px,9%)] top-[46%] z-[2] w-[min(360px,36%)] [translate:0_-50%] rounded-[20px] bg-white/95 p-6 text-black shadow-[0_24px_60px_rgb(0_0_0/.45)] max-md:left-4 max-md:right-4 max-md:top-24 max-md:w-auto max-md:max-w-[420px] max-md:[translate:0_0] max-md:p-4"
            >
              <h3 className="flex items-center justify-between gap-2.5 text-xl">
                Kia Sportage 2019
                <span className="grid size-[30px] shrink-0 place-items-center rounded-full bg-black">
                  <Check className="size-4 text-white" strokeWidth={2.4} />
                </span>
              </h3>
              <ul className="mt-3">
                {FICHA.map(([k, v], n) => (
                  <motion.li key={k} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + n * 0.1, duration: 0.5 }} className={cn("flex items-center gap-2.5 border-t border-black/10 py-2.5 text-[15px]", n > 2 && "max-md:hidden")}>
                    <i className="size-2 shrink-0 rounded-full bg-[#1d8a4a]" />
                    {k}
                    <span className="ml-auto text-black/55">{v}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          <div className="absolute inset-x-0 bottom-[72px] z-10 max-md:bottom-[68px]">
            <div className="container">
              <div className="flex max-w-4xl flex-col items-start gap-5 max-md:gap-4">
                <motion.h1 {...rise(0)} className="text-[clamp(40px,6.2vw,96px)] leading-[0.98] tracking-tightest">
                  {s.title}
                </motion.h1>
                <motion.p {...rise(1)} className="max-w-[460px] text-[clamp(17px,1.7vw,20px)] leading-snug text-white/90">
                  {s.sub}
                </motion.p>
                <motion.div {...rise(2)}>
                  <Button asChild variant="light" size="lg">
                    <Link href={s.href}>{s.cta}</Link>
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <button type="button" aria-label="Anterior" onClick={() => go(idx - 1)} className={cn(arrow, "left-[max(16px,env(safe-area-inset-left,0px))]")}>
        <ChevronLeft className="size-5" />
      </button>
      <button type="button" aria-label="Siguiente" onClick={() => go(idx + 1)} className={cn(arrow, "right-[max(16px,env(safe-area-inset-right,0px))]")}>
        <ChevronRight className="size-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3">
        <div className="flex gap-2">
          {SLIDES.map((d, i) => (
            <button key={d.id} type="button" aria-label={`Ir a la diapositiva ${i + 1}`} aria-current={i === idx} onClick={() => go(i)} className="relative h-6 w-12 focus-visible:outline-white">
              <span className="absolute inset-x-0 top-2.5 h-0.5 rounded bg-white/35" />
              <i
                onAnimationEnd={() => i === idx && go(idx + 1)}
                className={cn("absolute left-0 top-2.5 h-0.5 w-0 rounded bg-white", i === idx && "animate-fill group-hover:[animation-play-state:paused] group-focus-within:[animation-play-state:paused]", i === idx && paused && "[animation-play-state:paused]", i < idx && "w-full")}
              />
            </button>
          ))}
        </div>
        <button type="button" aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"} onClick={() => setPaused((p) => !p)} className="grid size-8 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-black focus-visible:outline-white">
          {paused ? <Play className="size-3 fill-current" /> : <Pause className="size-3 fill-current" />}
        </button>
      </div>
    </header>
  );
}
