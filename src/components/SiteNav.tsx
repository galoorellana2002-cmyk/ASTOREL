"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { ArrowUpRight, Heart, MapPin, Menu, X } from "lucide-react";
import { Wordmark } from "@/components/Wordmark";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/autos", label: "Inventario" },
  { href: "/#visor", label: "Experiencia 3D" },
  { href: "/#beneficios", label: "Cómo comprar" },
  { href: "/#confianza", label: "Nosotros" },
];

export function SiteNav({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <div className="hidden bg-band text-band-fg sm:block">
        <div className="container flex h-[34px] items-center justify-between text-[10px] tracking-[.1em]">
          <span>OTRA FORMA DE ENCONTRAR TU PRÓXIMO AUTO.</span>
          <span className="inline-flex items-center gap-2 tracking-normal">
            <MapPin className="size-3" aria-hidden="true" />
            Quito, Ecuador
          </span>
        </div>
      </div>
      <nav className={cn("sticky top-[env(safe-area-inset-top,0px)] z-50 border-b border-hair bg-bg/95 text-fg backdrop-blur-xl transition-shadow duration-300", scrolled && "shadow-[0_8px_30px_rgb(0_0_0/.12)]")}>
        <div className="container flex h-16 items-center justify-between gap-4 md:h-[90px]">
          <Link href="/" className="inline-flex min-h-11 items-center focus-visible:outline-fg" aria-label={name}>
            <Wordmark name={name} className="h-[15px] md:h-[17px]" />
          </Link>
          <ul className="hidden items-center gap-8 text-[13px] md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center underline-offset-[6px] transition hover:underline focus-visible:outline-fg">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 md:gap-6">
            <Link href="/autos" aria-label="Ver autos del patio" className="hidden min-h-11 min-w-11 items-center justify-center sm:inline-flex focus-visible:outline-fg">
              <Heart className="size-5" strokeWidth={1.4} aria-hidden="true" />
            </Link>
            <Link href="/#contacto" className="inline-flex h-11 items-center gap-[18px] border border-fg px-[18px] text-xs transition hover:bg-fg hover:text-bg focus-visible:outline-fg">
              Hablemos
              <ArrowUpRight className="size-4" strokeWidth={1.4} aria-hidden="true" />
            </Link>
            <Dialog.Trigger asChild>
              <button type="button" aria-label="Menú" className="inline-flex min-h-11 min-w-11 items-center justify-center md:hidden focus-visible:outline-fg">
                <Menu className="size-5" strokeWidth={1.6} aria-hidden="true" />
              </button>
            </Dialog.Trigger>
          </div>
        </div>
      </nav>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[61] flex flex-col overflow-y-auto bg-black px-[max(16px,env(safe-area-inset-left,0px))] pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-[calc(12px+env(safe-area-inset-top,0px))] text-white focus:outline-none data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        >
          <Dialog.Title className="sr-only">Menú principal</Dialog.Title>
          <div className="mx-auto flex h-11 w-full max-w-[1280px] items-center justify-between">
            <Dialog.Close className="inline-flex min-h-11 items-center gap-2 text-[15px] text-white/90 transition hover:text-white focus-visible:outline-white">
              <X className="size-5" strokeWidth={1.6} aria-hidden="true" />
              Cerrar
            </Dialog.Close>
          </div>
          <ul className="mx-auto my-auto flex w-full max-w-[1280px] flex-col py-10">
            {[...LINKS, { href: "/#contacto", label: "Contacto" }].map((l, i) => (
              <motion.li key={l.href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 + i * 0.07, ease: [0.2, 0.7, 0.2, 1] }}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-baseline justify-between gap-4 border-b border-band-line py-4 text-[clamp(34px,7vw,72px)] leading-[1.15] tracking-tight text-white/85 transition hover:text-white focus-visible:outline-white"
                >
                  <span className="flex items-baseline gap-5">
                    <span className="text-sm tracking-widest text-band-mut">0{i + 1}</span>
                    {l.label}
                  </span>
                  <ArrowUpRight className="size-7 translate-y-1 text-band-mut opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:text-white group-hover:opacity-100" aria-hidden="true" />
                </Link>
              </motion.li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
