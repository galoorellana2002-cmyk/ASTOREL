import { z } from "zod";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, MOVEMENT_TYPES, BODY_TYPES, DEFECT_CATEGORIES, LEAD_STATUS, RESERVATION_STATUS, SEGMENTS, SEVERITIES, VEHICLE_STATUS } from "./constants";

const text = (max: number) => z.string().trim().max(max);

export const defectSchema = z.object({
  zone: text(80).min(1, "Falta la zona"),
  detail: text(200).min(1, "Falta el detalle"),
  category: z.enum(DEFECT_CATEGORIES),
  severity: z.enum(SEVERITIES),
  posX: z.coerce.number().min(-1).max(1).default(0),
  posY: z.coerce.number().min(-1).max(1).default(0),
  posZ: z.coerce.number().min(-1).max(1).default(0),
});

export const legalSchema = z.object({
  label: text(60).min(1),
  value: text(120).min(1),
  status: z.enum(["OK", "WARN"]),
});

export const vehicleSchema = z.object({
  brand: text(40).min(1, "Falta la marca"),
  model: text(40).min(1, "Falta el modelo"),
  version: text(60).default(""),
  year: z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1),
  km: z.coerce.number().int().min(0).max(2_000_000),
  priceUsd: z.coerce.number().min(0).max(5_000_000),
  bodyType: z.enum(BODY_TYPES),
  color: text(40).default(""),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido").default("#5d6066"),
  description: text(2000).default(""),
  status: z.enum(VEHICLE_STATUS),
  published: z.boolean(),
  defects: z.array(defectSchema).max(40),
  legal: z.array(legalSchema).max(20),
});

export const leadUpdateSchema = z.object({
  segment: z.enum(SEGMENTS),
  status: z.enum(LEAD_STATUS),
  notes: text(2000).default(""),
  segmentLocked: z.boolean(),
});

export const reservationInputSchema = z.object({
  vehicleId: z.string().min(1),
  name: text(80).min(2, "Escribe tu nombre"),
  phone: z.string().transform((v) => v.replace(/[\s.-]/g, "")).pipe(z.string().regex(/^(?:\+?593|0)9\d{8}$/, "Escribe un celular válido, por ejemplo 0991234567")),
  note: text(300).default(""),
});

export const reservationStatusSchema = z.enum(RESERVATION_STATUS);

export const chatSchema = z.object({
  sessionId: z.string().min(1).max(60).optional(),
  message: z.string().trim().min(1).max(500),
  currentSlug: z.string().max(80).optional(),
  viewed: z.number().int().min(0).max(500).optional(),
  viewerOpens: z.number().int().min(0).max(500).optional(),
});

export const movementSchema = z
  .object({
    type: z.enum(MOVEMENT_TYPES),
    category: z.string(),
    amountUsd: z.coerce.number().positive("El monto debe ser mayor a 0").max(5_000_000),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
    description: text(200).default(""),
    vehicleId: z.string().max(40).optional().or(z.literal("")),
  })
  .superRefine((m, ctx) => {
    const ok = (m.type === "INGRESO" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES) as readonly string[];
    if (!ok.includes(m.category)) ctx.addIssue({ code: "custom", path: ["category"], message: "Categoría no válida para este tipo" });
  });
