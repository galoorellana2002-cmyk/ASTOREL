import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageCircle } from "lucide-react";
import { getVehicleBySlug } from "@/lib/vehicles";
import { Viewer3D } from "@/components/Viewer3D";
import { ReserveForm } from "@/components/ReserveForm";
import { TrackViewed } from "@/components/TrackViewed";
import { Button } from "@/components/ui/button";
import { Dot } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { BODY_ART, VEHICLE_STATUS_LABEL, type VehicleStatus } from "@/lib/constants";
import { kmFmt, money, waLink } from "@/lib/format";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const v = await getVehicleBySlug(params.slug);
  return v ? { title: `${v.brand} ${v.model} ${v.year}` } : { title: "Auto no encontrado" };
}

const tag = "inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-[3px] text-[13px]";

export default async function VehiclePage({ params }: { params: { slug: string } }) {
  const v = await getVehicleBySlug(params.slug);
  if (!v) notFound();

  const label = `${v.brand} ${v.model} ${v.year}`;
  const available = v.status === "AVAILABLE";
  const wa = waLink(`Hola, me interesa el ${label} (${money(v.priceCents)}).`);

  return (
    <div className="container">
      <TrackViewed slug={v.slug} />
      <nav aria-label="Ruta" className="flex flex-wrap items-center gap-1.5 pt-5 text-sm text-mut">
        <Link href="/autos" className="transition hover:text-fg hover:underline">Autos</Link>
        <ChevronRight className="size-3.5" aria-hidden="true" />
        <span className="text-fg">{label}</span>
      </nav>

      <div className="grid grid-cols-1 items-start gap-8 pb-16 pt-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Reveal y={16}>
          <Viewer3D
            modelUrl={v.modelUrl}
            art={BODY_ART[v.bodyType] ?? "sedan"}
            hex={v.hex}
            label={label}
            defects={v.defects.map((d) => ({ id: d.id, zone: d.zone, detail: d.detail, severity: d.severity, posX: d.posX, posY: d.posY, posZ: d.posZ }))}
          />
        </Reveal>

        <Reveal as="section" delay={0.1} y={16} className="min-w-0 lg:sticky lg:top-24">
          <p className="text-[13px] uppercase tracking-[.16em] text-mut">{v.bodyType} · {v.year}</p>
          <h1 className="mt-1 text-[clamp(30px,4vw,46px)] leading-[1.08] tracking-tightest">{v.brand} {v.model}</h1>
          <p className="mt-1.5 text-lg text-mut">{v.version}</p>
          <p className="my-4 text-[38px] tabular-nums tracking-tight">{money(v.priceCents)}</p>
          <div className="flex flex-wrap gap-2">
            <span className={tag}>{VEHICLE_STATUS_LABEL[v.status as VehicleStatus] ?? v.status}</span>
            <span className={tag}>{kmFmt(v.km)}</span>
            {v.color && <span className={tag}>{v.color}</span>}
          </div>
          {v.description && <p className="mt-5 text-[17px] leading-relaxed text-mut">{v.description}</p>}

          <h2 className="mb-2.5 mt-8 text-[13px] uppercase tracking-[.08em] text-mut">Ficha legal</h2>
          <ul className="m-0 list-none p-0">
            {v.legal.length ? (
              v.legal.map((l) => (
                <li key={l.id} className="flex items-baseline gap-2.5 border-t border-hair py-[11px] text-[15px] first:border-t-0">
                  <Dot tone={l.status === "OK" ? "ok" : "warn"} className="-translate-y-px" />
                  {l.label}
                  <span className="ml-auto text-right text-mut">{l.value}</span>
                </li>
              ))
            ) : (
              <li className="text-mut">Se está actualizando.</li>
            )}
          </ul>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button asChild variant="outline">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <MessageCircle aria-hidden="true" />
                Preguntar por WhatsApp
              </a>
            </Button>
          </div>
          {available ? <ReserveForm vehicleId={v.id} /> : <p className="mt-6 text-[13px] text-mut">Este auto está {VEHICLE_STATUS_LABEL[v.status as VehicleStatus]?.toLowerCase()}.</p>}
        </Reveal>
      </div>
    </div>
  );
}
