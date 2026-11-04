"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import type { HeroSlide } from "@/lib/hero";

const CHECKS = ["Fichas legales claras", "Defectos marcados en 3D", "Recorrido por fuera y por dentro", "Atención directa por WhatsApp"];

const DEMO: HeroSlide = { key: "demo", image: "/design/portada.webp", title: "Autos que brillan con luz propia", meta: "Foto de ejemplo · Pronto verás aquí los autos del patio", href: "/autos" };

export function HomeHero({ slides }: { slides: HeroSlide[] }) {
  const list = slides.length ? slides : [DEMO];
  const [i, setI] = useState(0);
  const s = list[i % list.length] ?? DEMO;
  return (
    <>
      <section aria-labelledby="hero-t" className="container pb-10 pt-12 md:pb-14 md:pt-[54px]">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end md:gap-16">
          <div className="min-w-0 md:max-w-[900px]">
            <motion.span className="mb-5 block text-[11px] tracking-[.16em] text-mut" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>PATIO VIRTUAL / SELECCIÓN EXTRAORDINARIA</motion.span>
            <h1 id="hero-t" className="text-balance text-[clamp(40px,7.2vw,76px)] leading-[1.02] tracking-[-0.052em]">
              {["Tu próximo auto.", "Desde otra perspectiva."].map((line, k) => (
                <span key={line} className="-mb-[0.1em] block overflow-hidden pb-[0.1em]">
                  <motion.span className="block" initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.12 + k * 0.12, ease: [0.2, 0.7, 0.2, 1] }}>
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>
          </div>
          <motion.div className="flex max-w-[442px] flex-col gap-6 pb-1.5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.45, ease: [0.2, 0.7, 0.2, 1] }}>
            <p className="text-[15px] leading-[1.65] text-mut">Explora cada detalle. Compara sin prisa. Encuentra un auto a tu altura, con la confianza de dar el siguiente paso.</p>
            <Link href="#autos" className="group inline-flex min-h-11 w-fit items-center gap-6 text-[13px] underline-offset-[6px] hover:underline focus-visible:outline-fg">
              Explorar inventario
              <ArrowDownRight className="size-[19px] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5" strokeWidth={1.4} aria-hidden="true" />
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="relative h-[clamp(300px,42vw,430px)] overflow-hidden bg-alt">
        <AnimatePresence initial={false}>
          <motion.div key={s.key} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img src={s.image} alt={s.title} className="size-full object-cover object-[70%_60%]" fetchPriority="high" initial={{ scale: 1.07 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: [0.2, 0.7, 0.2, 1] }} />
          </motion.div>
        </AnimatePresence>
        <motion.div className="container absolute inset-x-0 bottom-5 flex items-end justify-between gap-3 md:bottom-7" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6, ease: [0.2, 0.7, 0.2, 1] }}>
          <Link href={s.href} className="flex min-w-0 flex-col gap-1.5 bg-white px-5 py-[15px] text-black focus-visible:outline-black">
            <span className="text-[9px] tracking-[.16em] text-[#5c5c5c]">EL ELEGIDO DE LA SEMANA</span>
            <span className="truncate text-lg">{s.title}</span>
            <span className="text-[11px] text-[#5c5c5c]">{s.meta}</span>
          </Link>
          <button
            type="button"
            onClick={() => setI((n) => (n + 1) % list.length)}
            disabled={list.length < 2}
            aria-label="Ver el siguiente auto"
            className="inline-flex shrink-0 items-center gap-3 bg-white p-3.5 text-[11px] text-black disabled:cursor-default focus-visible:outline-black"
          >
            {String((i % list.length) + 1).padStart(2, "0")} / {String(list.length).padStart(2, "0")}
            <ArrowRight className="size-[18px]" strokeWidth={1.4} aria-hidden="true" />
          </button>
        </motion.div>
      </div>

      <ul className="container grid grid-cols-1 gap-x-6 gap-y-3 border-b border-hair py-5 text-[11px] text-mut sm:grid-cols-2 lg:flex lg:h-[60px] lg:items-center lg:justify-between lg:py-0">
        {CHECKS.map((c, k) => (
          <motion.li key={c} className="flex items-center gap-2.5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 + k * 0.08 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-fg">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {c}
          </motion.li>
        ))}
      </ul>
    </>
  );
}
