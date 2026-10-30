import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { PATIO_NAME } from "@/lib/format";
import { Wordmark } from "@/components/Wordmark";

export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="min-h-svh bg-alt md:grid md:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="flex flex-col gap-2 bg-black px-[max(12px,env(safe-area-inset-left,0px))] pb-2 pt-[calc(12px+env(safe-area-inset-top,0px))] text-white max-md:sticky max-md:top-0 max-md:z-30 md:sticky md:top-0 md:h-svh md:gap-1 md:p-4 md:pt-5">
        <div className="flex items-center justify-between px-1.5 py-1 md:mb-5 md:px-3">
          <Wordmark name={PATIO_NAME} className="h-4 text-white" />
          <form action={logout} className="md:hidden">
            <button type="submit" aria-label="Cerrar sesión" className="grid size-9 place-items-center rounded-full text-[#c9cacd] transition hover:bg-white/10 hover:text-white focus-visible:outline-white">
              <LogOut className="size-[18px]" strokeWidth={1.6} />
            </button>
          </form>
        </div>
        <AdminNav />
        <Link href="/" target="_blank" className="flex items-center gap-2 rounded-none px-3 py-2.5 text-[15px] text-[#c9cacd] transition hover:bg-white/5 hover:text-white focus-visible:outline-white max-md:hidden">
          Ver la tienda
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
        <div className="flex-1 max-md:hidden" />
        <div className="break-all px-3 py-1 text-xs text-[#8a8b90] max-md:hidden">{admin.email}</div>
        <form action={logout} className="max-md:hidden">
          <button type="submit" className="flex w-full items-center gap-2.5 rounded-none px-3 py-2.5 text-left text-[15px] text-[#c9cacd] transition hover:bg-white/5 hover:text-white focus-visible:outline-white">
            <LogOut className="size-[18px]" strokeWidth={1.6} aria-hidden="true" />
            Cerrar sesión
          </button>
        </form>
      </aside>
      <div className="min-w-0 px-[max(16px,env(safe-area-inset-left,0px))] py-6 md:px-9 md:py-9">
        <div className="mx-auto max-w-[1180px]">{children}</div>
      </div>
    </div>
  );
}
