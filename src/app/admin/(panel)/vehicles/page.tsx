import Link from "next/link";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { money, kmFmt } from "@/lib/format";
import { VEHICLE_STATUS_LABEL, type VehicleStatus } from "@/lib/constants";
import { Badge, Pill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Small, Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AdminHead, Flash } from "@/components/admin/ui";

export default async function VehiclesAdminPage({ searchParams }: { searchParams: { saved?: string } }) {
  const vehicles = await db.vehicle.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { defects: true } } } });
  return (
    <>
      <AdminHead
        title="Autos"
        sub={`${vehicles.length} en total. El modelo 3D se sube en cada auto (archivo .glb).`}
        action={
          <Button asChild size="sm">
            <Link href="/admin/vehicles/new"><Plus aria-hidden="true" />Agregar auto</Link>
          </Button>
        }
      />
      {searchParams.saved && <Flash>Cambios guardados.</Flash>}
      <Panel>
        <Table>
          <THead>
            <TR className="hover:bg-transparent"><TH>Auto</TH><TH>Año</TH><TH>Km</TH><TH>Precio</TH><TH>Estado</TH><TH>3D</TH><TH>Defectos</TH><TH>Público</TH></TR>
          </THead>
          <TBody>
            {vehicles.map((v) => (
              <TR key={v.id}>
                <TD><Link className="hover:underline" href={`/admin/vehicles/${v.id}`}>{v.brand} {v.model}</Link><Small>{v.version}</Small></TD>
                <TD>{v.year}</TD>
                <TD>{kmFmt(v.km)}</TD>
                <TD>{money(v.priceCents)}</TD>
                <TD><Pill k={v.status}>{VEHICLE_STATUS_LABEL[v.status as VehicleStatus] ?? v.status}</Pill></TD>
                <TD>{v.modelUrl ? "Sí" : <Small>Pendiente</Small>}</TD>
                <TD>{v._count.defects}</TD>
                <TD>{v.published ? "Sí" : <Badge tone="outline">Oculto</Badge>}</TD>
              </TR>
            ))}
            {!vehicles.length && <TR><TD colSpan={8}><Small>Todavía no hay autos.</Small></TD></TR>}
          </TBody>
        </Table>
      </Panel>
    </>
  );
}
