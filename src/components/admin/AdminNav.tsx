"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/admin", label: "Resumen", exact: true },
  { href: "/admin/vehicles", label: "Autos" },
  { href: "/admin/leads", label: "Clientes" },
  { href: "/admin/reservations", label: "Reservas" },
  { href: "/admin/finance", label: "Finanzas" },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <>
      {ITEMS.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        return (
          <Link key={i.href} href={i.href} aria-current={active ? "page" : undefined}>
            {i.label}
          </Link>
        );
      })}
    </>
  );
}
