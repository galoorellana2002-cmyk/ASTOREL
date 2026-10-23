import Link from "next/link";
import { db } from "@/lib/db";
import { money, kmFmt } from "@/lib/format";
import { VEHICLE_STATUS_LABEL, type VehicleStatus } from "@/lib/constants";

export default async function VehiclesAdminPage({ searchParams }: { searchParams: { saved?: string } }) {
  const vehicles = await db.vehicle.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { defects: true } } } });
  return (
    <>
      <div className="adm-head">
        <div>
          <h1>Autos</h1>
          <p className="adm-sub">{vehicles.length} en total. El modelo 3D se sube en cada auto (archivo .glb).</p>
        </div>
        <Link className="btn sm" href="/admin/vehicles/new">Agregar auto</Link>
      </div>
      {searchParams.saved && <p className="flash" role="status">Cambios guardados.</p>}
      <div className="panel">
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr><th>Auto</th><th>Año</th><th>Km</th><th>Precio</th><th>Estado</th><th>3D</th><th>Defectos</th><th>Público</th></tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id}>
                  <td><Link className="row-link" href={`/admin/vehicles/${v.id}`}>{v.brand} {v.model}</Link><div className="small">{v.version}</div></td>
                  <td>{v.year}</td>
                  <td>{kmFmt(v.km)}</td>
                  <td>{money(v.priceCents)}</td>
                  <td><span className={`pill ${v.status}`}>{VEHICLE_STATUS_LABEL[v.status as VehicleStatus] ?? v.status}</span></td>
                  <td>{v.modelUrl ? "Sí" : <span className="small">Pendiente</span>}</td>
                  <td>{v._count.defects}</td>
                  <td>{v.published ? "Sí" : <span className="pill off">Oculto</span>}</td>
                </tr>
              ))}
              {!vehicles.length && <tr><td colSpan={8} className="small">Todavía no hay autos.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
