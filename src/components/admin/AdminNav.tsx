"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarCheck, Car, LayoutDashboard, Users, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/vehicles", label: "Autos", icon: Car },
  { href: "/admin/leads", label: "Clientes", icon: Users },
  { href: "/admin/reservations", label: "Reservas", icon: CalendarCheck },
  { href: "/admin/finance", label: "Finanzas", icon: Wallet },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Panel" className="flex gap-1 overflow-x-auto [scrollbar-width:none] md:flex-col md:overflow-visible [&::-webkit-scrollbar]:hidden">
      {ITEMS.map((i) => {
        const active = i.exact ? path === i.href : path.startsWith(i.href);
        const Icon = i.icon;
        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            className={cn("relative flex shrink-0 items-center gap-2.5 rounded-none px-3 py-2.5 text-[15px] transition-colors focus-visible:outline-white max-md:py-2 max-md:text-sm", active ? "text-white" : "text-[#c9cacd] hover:bg-white/5 hover:text-white")}
          >
            {active && <motion.span layoutId="adm-active" className="absolute inset-0 rounded-none bg-white/12 border-l-2 border-white" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
            <Icon className="relative size-[18px]" strokeWidth={1.6} aria-hidden="true" />
            <span className="relative">{i.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
