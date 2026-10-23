import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getVehicleBySlug } from "@/lib/vehicles";
import { Viewer3D } from "@/components/Viewer3D";
import { ReserveForm } from "@/components/ReserveForm";
import { TrackViewed } from "@/components/TrackViewed";
import { BODY_ART, VEHICLE_STATUS_LABEL, type VehicleStatus } from "@/lib/constants";
import { kmFmt, money, waLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const v = await getVehicleBySlug(params.slug);
  return v ? { title: `${v.brand} ${v.model} ${v.year}` } : { title: "Auto no encontrado" };
}

export default async function VehiclePage({ params }: { params: { slug: string } }) {
  const v = await getVehicleBySlug(params.slug);
  if (!v) notFound();

  const label = `${v.brand} ${v.model} ${v.year}`;
  const available = v.status === "AVAILABLE";
  const wa = waLink(`Hola, me interesa el ${label} (${money(v.priceCents)}).`);

  return (
    <div className="wrap">
      <TrackViewed slug={v.slug} />
      <nav className="crumb" aria-label="Ruta">
        <Link href="/autos">Autos</Link>
        <span aria-hidden="true">/</span>
        <span>{label}</span>
      </nav>

      <div className="pd">
        <Viewer3D
          modelUrl={v.modelUrl}
          art={BODY_ART[v.bodyType] ?? "sedan"}
          hex={v.hex}
          label={label}
          defects={v.defects.map((d) => ({ id: d.id, zone: d.zone, detail: d.detail, severity: d.severity, posX: d.posX, posY: d.posY, posZ: d.posZ }))}
        />

        <aside>
          <p className="eyebrow">{v.bodyType} · {v.year}</p>
          <h1>{v.brand} {v.model}</h1>
          <p className="sub">{v.version}</p>
          <p className="price">{money(v.priceCents)}</p>
          <div className="tags">
            <span className="tag">{VEHICLE_STATUS_LABEL[v.status as VehicleStatus] ?? v.status}</span>
            <span className="tag">{kmFmt(v.km)}</span>
            {v.color && <span className="tag">{v.color}</span>}
          </div>
          {v.description && <p className="desc">{v.description}</p>}

          <h2 className="h">Ficha legal</h2>
          <ul className="rows">
            {v.legal.length ? (
              v.legal.map((l) => (
                <li key={l.id}>
                  <i className={`dot ${l.status === "OK" ? "ok" : "warn"}`} />
                  {l.label}
                  <span className="v">{l.value}</span>
                </li>
              ))
            ) : (
              <li>Se está actualizando.</li>
            )}
          </ul>

          <div className="cta">
            <a className="btn out" href={wa} target="_blank" rel="noopener noreferrer">
              Preguntar por WhatsApp
            </a>
          </div>
          {available ? <ReserveForm vehicleId={v.id} /> : <p className="small" style={{ marginTop: 24 }}>Este auto está {VEHICLE_STATUS_LABEL[v.status as VehicleStatus]?.toLowerCase()}.</p>}
        </aside>
      </div>
    </div>
  );
}
