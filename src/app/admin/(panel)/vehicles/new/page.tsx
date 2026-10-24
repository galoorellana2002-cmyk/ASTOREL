import { VehicleForm } from "@/components/admin/VehicleForm";
import { AdminHead } from "@/components/admin/ui";

export default function NewVehiclePage() {
  return (
    <>
      <AdminHead title="Agregar auto" back={{ href: "/admin/vehicles", label: "← Autos" }} />
      <VehicleForm />
    </>
  );
}
