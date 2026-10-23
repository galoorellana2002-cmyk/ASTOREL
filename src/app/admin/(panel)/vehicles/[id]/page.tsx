import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { VehicleForm } from "@/components/admin/VehicleForm";
import { deleteVehicle } from "../../../actions";
import { ConfirmButton } from "@/components/admin/ConfirmButton";

export default async function EditVehiclePage({ params }: { params: { id: string } }) {
  const v = await db.vehicle.findUnique({ where: { id: params.id }, include: { defects: true, legal: true } });
  if (!v) notFound();
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>{v.brand} {v.model} {v.year}</h1>
          <p className="adm-sub">/autos/{v.slug}</p>
        </div>
        <form action={deleteVehicle}>
          <input type="hidden" name="id" value={v.id} />
          <ConfirmButton className="btn sm danger" message="¿Eliminar este auto y su modelo 3D? No se puede deshacer.">Eliminar auto</ConfirmButton>
        </form>
      </div>
      <VehicleForm
        vehicle={{
          id: v.id, brand: v.brand, model: v.model, version: v.version, year: v.year, km: v.km, priceUsd: v.priceCents / 100, bodyType: v.bodyType, color: v.color,
          hex: v.hex, description: v.description, status: v.status, published: v.published, modelUrl: v.modelUrl, coverUrl: v.coverUrl,
          defects: v.defects.map((d) => ({ zone: d.zone, detail: d.detail, category: d.category, severity: d.severity, posX: d.posX, posY: d.posY, posZ: d.posZ })),
          legal: v.legal.map((l) => ({ label: l.label, value: l.value, status: l.status })),
        }}
      />
    </>
  );
}
