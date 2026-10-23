"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { reservationInputSchema } from "@/lib/validators";
import { rateLimit } from "@/lib/rateLimit";
import { refreshLead } from "@/lib/leads";

export interface ReserveState {
  ok: boolean;
  error?: string;
}

/** Solicitud de reserva desde la tienda. No cobra nada: un asesor confirma por WhatsApp. */
export async function createReservation(_prev: ReserveState, formData: FormData): Promise<ReserveState> {
  // Campo trampa: los bots lo llenan, las personas no lo ven.
  if (formData.get("website")) return { ok: true };

  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`reserve:${ip}`, 5, 10 * 60_000)) return { ok: false, error: "Demasiados intentos. Prueba en unos minutos." };

  const parsed = reservationInputSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    name: formData.get("name"),
    phone: formData.get("phone"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
  const { vehicleId, name, phone, note } = parsed.data;

  const vehicle = await db.vehicle.findFirst({ where: { id: vehicleId, published: true, status: "AVAILABLE" } });
  if (!vehicle) return { ok: false, error: "Este auto ya no está disponible." };

  const normalized = "0" + phone.replace(/^(?:\+?593|0)/, "");
  let lead = await db.lead.findFirst({ where: { phone: normalized } });
  if (!lead) lead = await db.lead.create({ data: { name, phone: normalized, source: "FORM", vehicleId } });
  else lead = await db.lead.update({ where: { id: lead.id }, data: { name: lead.name ?? name, vehicleId } });

  await db.reservation.create({ data: { vehicleId, leadId: lead.id, note } });
  await refreshLead(lead.id);
  revalidatePath("/admin");
  return { ok: true };
}
