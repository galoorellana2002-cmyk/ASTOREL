import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logout } from "../actions";
import { AdminNav } from "@/components/admin/AdminNav";
import { PATIO_NAME } from "@/lib/format";

export const metadata: Metadata = { title: "Panel", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <div className="adm">
      <aside className="adm-side">
        <div className="adm-brand">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/logo-astorel-blanco.svg" alt={PATIO_NAME} /></div>
        <AdminNav />
        <Link href="/" target="_blank">Ver la tienda ↗</Link>
        <div className="sp" />
        <div className="who">{admin.email}</div>
        <form action={logout}>
          <button className="link" type="submit">Cerrar sesión</button>
        </form>
      </aside>
      <div className="adm-main">{children}</div>
    </div>
  );
}
