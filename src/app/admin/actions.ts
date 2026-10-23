"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { db } from "@/lib/db";
import { clearSessionCookie, requireAdmin, setSessionCookie } from "@/lib/auth";
import { signToken } from "@/lib/token";
import { rateLimit } from "@/lib/rateLimit";
import { movementSchema, leadUpdateSchema, reservationStatusSchema, vehicleSchema } from "@/lib/validators";
import { removeUpload, verifyUpload } from "@/lib/uploads";
import { slugify } from "@/lib/format";
import { refreshLead } from "@/lib/leads";
import { parseDay } from "@/lib/finance";

export interface FormState {
  error?: string;
}

// Hash falso para que el tiempo de respuesta no delate si el correo existe.
const DUMMY_HASH = "$2a$10$CwTycUXWue0Thq9StjUM0uJ8.2mP1o1h3o9y4vQ1rJZ5m1b7m8y0e";

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = headers().get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`login:${ip}`, 8, 10 * 60_000)) return { error: "Demasiados intentos. Prueba en 10 minutos." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const admin = await db.admin.findUnique({ where: { email } });
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) return { error: "Correo o contraseña incorrectos." };

  setSessionCookie(await signToken(admin.id, admin.email));
  redirect("/admin");
}

export async function logout() {
  clearSessionCookie();
  redirect("/admin/login");
}

// ---------- Autos ----------

function parseJsonField(value: FormDataEntryValue | null): unknown {
  try {
    return JSON.parse(String(value ?? "[]"));
  } catch {
    return [];
  }
}

async function uniqueSlug(base: string, ignoreId?: string): Promise<string> {
  let slug = base || "auto";
  for (let i = 2; ; i++) {
    const found = await db.vehicle.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === ignoreId) return slug;
    slug = `${base}-${i}`;
  }
}

export async function saveVehicle(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "") || null;

  const parsed = vehicleSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
    version: formData.get("version") ?? "",
    year: formData.get("year"),
    km: formData.get("km"),
    priceUsd: formData.get("priceUsd"),
    bodyType: formData.get("bodyType"),
    color: formData.get("color") ?? "",
    hex: formData.get("hex") ?? "#5d6066",
    description: formData.get("description") ?? "",
    status: formData.get("status"),
    published: formData.get("published") === "on",
    defects: parseJsonField(formData.get("defects")),
    legal: parseJsonField(formData.get("legal")),
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue?.path.join(".") || "Formulario"}: ${issue?.message ?? "dato inválido"}` };
  }
  const d = parsed.data;

  const existing = id ? await db.vehicle.findUnique({ where: { id } }) : null;
  if (id && !existing) return { error: "Ese auto ya no existe." };

  // Archivos (opcionales). Si falla la validación no se guarda nada.
  let modelUrl = existing?.modelUrl ?? null;
  let coverUrl = existing?.coverUrl ?? null;
  const newModel = String(formData.get("modelUrl") ?? "");
  const newCover = String(formData.get("coverUrl") ?? "");
  const newUploads: string[] = [];
  try {
    if (newModel) {
      await verifyUpload(newModel, "model");
      modelUrl = newModel;
      newUploads.push(newModel);
    }
    if (newCover) {
      await verifyUpload(newCover, "image");
      coverUrl = newCover;
      newUploads.push(newCover);
    }
  } catch (e) {
    await Promise.all(newUploads.map(removeUpload));
    return { error: e instanceof Error ? e.message : "No se pudo guardar el archivo." };
  }
  if (formData.get("removeModel") === "on" && !newUploads.includes(modelUrl ?? "")) modelUrl = null;

  const data = {
    brand: d.brand,
    model: d.model,
    version: d.version,
    year: d.year,
    km: d.km,
    priceCents: Math.round(d.priceUsd * 100),
    bodyType: d.bodyType,
    color: d.color,
    hex: d.hex,
    description: d.description,
    status: d.status,
    published: d.published,
    modelUrl,
    coverUrl,
  };

  const children = {
    defects: { create: d.defects },
    legal: { create: d.legal },
  };

  let vehicleId: string;
  if (existing) {
    // Defectos y ficha legal se reemplazan completos: el formulario es la fuente de verdad.
    await db.$transaction([
      db.defect.deleteMany({ where: { vehicleId: existing.id } }),
      db.legalCheck.deleteMany({ where: { vehicleId: existing.id } }),
      db.vehicle.update({ where: { id: existing.id }, data: { ...data, ...children } }),
    ]);
    vehicleId = existing.id;
    if (existing.modelUrl && existing.modelUrl !== modelUrl) await removeUpload(existing.modelUrl);
    if (existing.coverUrl && existing.coverUrl !== coverUrl) await removeUpload(existing.coverUrl);
  } else {
    const slug = await uniqueSlug(slugify(`${d.brand} ${d.model} ${d.year}`));
    const created = await db.vehicle.create({ data: { ...data, slug, ...children } });
    vehicleId = created.id;
  }

  revalidatePath("/", "layout");
  redirect(`/admin/vehicles?saved=${vehicleId}`);
}

export async function deleteVehicle(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const v = await db.vehicle.findUnique({ where: { id } });
  if (!v) return;
  await db.vehicle.delete({ where: { id } });
  await Promise.all([removeUpload(v.modelUrl), removeUpload(v.coverUrl)]);
  revalidatePath("/", "layout");
  redirect("/admin/vehicles");
}

// ---------- Clientes ----------

export async function updateLead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const parsed = leadUpdateSchema.safeParse({
    segment: formData.get("segment"),
    status: formData.get("status"),
    notes: formData.get("notes") ?? "",
    segmentLocked: formData.get("segmentLocked") === "on",
  });
  if (!parsed.success) return;
  await db.lead.update({ where: { id }, data: parsed.data });
  // Si destrabó el segmento, se vuelve a calcular automáticamente.
  if (!parsed.data.segmentLocked) await refreshLead(id);
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}

export async function deleteLead(formData: FormData) {
  await requireAdmin();
  await db.lead.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/admin", "layout");
  redirect("/admin/leads");
}

// ---------- Reservas ----------

export async function setReservationStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = z.union([reservationStatusSchema, z.literal("")]).safeParse(formData.get("status"));
  if (!status.success || !status.data) return;
  const r = await db.reservation.update({ where: { id }, data: { status: status.data } });
  // Confirmar reserva marca el auto como reservado; cancelarla lo libera si no queda otra confirmada.
  const confirmed = await db.reservation.count({ where: { vehicleId: r.vehicleId, status: "CONFIRMADA" } });
  const vehicle = await db.vehicle.findUnique({ where: { id: r.vehicleId }, select: { status: true } });
  if (vehicle && vehicle.status !== "SOLD") {
    await db.vehicle.update({ where: { id: r.vehicleId }, data: { status: confirmed > 0 ? "RESERVED" : "AVAILABLE" } });
  }
  revalidatePath("/", "layout");
}

// ---------- Finanzas ----------

export async function addMovement(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = movementSchema.safeParse({
    type: formData.get("type"),
    category: formData.get("category"),
    amountUsd: formData.get("amountUsd"),
    date: formData.get("date"),
    description: formData.get("description") ?? "",
    vehicleId: formData.get("vehicleId") ?? "",
  });
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { error: `${i?.path.join(".") || "Formulario"}: ${i?.message ?? "dato inválido"}` };
  }
  const d = parsed.data;
  const needsCar = ["COMPRA_AUTO", "VENTA_AUTO"].includes(d.category);
  if (needsCar && !d.vehicleId) return { error: "Elige el auto al que pertenece esta compra o venta." };
  if (d.vehicleId) {
    const v = await db.vehicle.findUnique({ where: { id: d.vehicleId }, select: { id: true } });
    if (!v) return { error: "Ese auto ya no existe." };
  }

  await db.$transaction(async (tx) => {
    await tx.movement.create({
      data: {
        type: d.type, category: d.category, amountCents: Math.round(d.amountUsd * 100),
        date: parseDay(d.date), description: d.description, vehicleId: d.vehicleId || null,
      },
    });
    // Registrar la venta de un auto lo marca como vendido en la tienda.
    if (d.category === "VENTA_AUTO" && d.vehicleId) await tx.vehicle.update({ where: { id: d.vehicleId }, data: { status: "SOLD" } });
  });
  revalidatePath("/", "layout");
  redirect("/admin/finance?ok=1");
}

export async function deleteMovement(formData: FormData) {
  await requireAdmin();
  await db.movement.deleteMany({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/admin/finance");
}
