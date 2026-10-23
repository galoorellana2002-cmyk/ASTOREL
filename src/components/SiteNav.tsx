"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "/autos", label: "Autos del patio" },
  { href: "/#visor", label: "Visor 3D" },
  { href: "/#confianza", label: "Confianza" },
  { href: "/#contacto", label: "Contacto" },
];

export function SiteNav({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const first = useRef(true);

  useEffect(() => {
    document.body.classList.toggle("nofs", open);
    if (first.current) {
      first.current = false;
      return;
    }
    (open ? closeRef.current : btnRef.current)?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // React 18 no tipa `inert`; se aplica a mano para que el menú cerrado no reciba foco.
  useEffect(() => {
    menuRef.current?.toggleAttribute("inert", !open);
  }, [open]);

  return (
    <>
      <nav className="top">
        <div className="wrap">
          <button ref={btnRef} type="button" className="menu-btn" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(true)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            <span>Menú</span>
          </button>
          <Link className="brand" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-astorel-blanco.svg" alt={name} />
          </Link>
          <Link className="nav-r" href="/#contacto">
            Contacto
          </Link>
        </div>
      </nav>
      <div ref={menuRef} className={`menu${open ? " open" : ""}`} id="menu" aria-label="Menú principal">
        <div className="m-top">
          <button ref={closeRef} type="button" onClick={() => setOpen(false)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            Cerrar
          </button>
        </div>
        <ul>
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
