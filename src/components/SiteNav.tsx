"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/autos", label: "Autos del patio" },
  { href: "/#visor", label: "Visor 3D" },
  { href: "/#confianza", label: "Confianza" },
  { href: "/#contacto", label: "Contacto" },
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
      <nav className={cn("sticky top-[env(safe-area-inset-top,0px)] z-50 bg-black/95 text-white backdrop-blur-xl transition-shadow duration-300", scrolled && "shadow-[0_8px_30px_rgb(0_0_0/.35)]")}>
        <div className="container grid h-14 grid-cols-[1fr_auto_1fr] items-center gap-3">
          <Dialog.Trigger asChild>
            <button type="button" className="inline-flex min-h-11 min-w-11 items-center gap-2.5 justify-self-start text-[15px] text-white/90 transition hover:text-white focus-visible:outline-white">
              <Menu className="size-5" strokeWidth={1.6} aria-hidden="true" />
              <span className="max-[420px]:sr-only">Menú</span>
            </button>
          </Dialog.Trigger>
          <Link href="/" className="inline-flex min-h-11 items-center px-2 focus-visible:outline-white" aria-label={name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-astorel-blanco.svg" alt={name} className="h-[18px] w-auto max-[420px]:h-[15px]" />
          </Link>
          <Link href="/#contacto" className="inline-flex min-h-11 items-center justify-self-end text-[15px] text-white/90 underline-offset-[6px] transition hover:text-white hover:underline focus-visible:outline-white">
            Contacto
          </Link>
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
            {LINKS.map((l, i) => (
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
