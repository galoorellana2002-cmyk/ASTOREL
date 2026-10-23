export const SEGMENTS = ["MIRON", "PREGUNTON", "NEGOCIANTE", "CLIENTE_FINAL"] as const;
export type Segment = (typeof SEGMENTS)[number];
export const SEGMENT_LABEL: Record<Segment, string> = {
  MIRON: "Mirón",
  PREGUNTON: "Preguntón",
  NEGOCIANTE: "Negociante",
  CLIENTE_FINAL: "Cliente final",
};
export const SEGMENT_HINT: Record<Segment, string> = {
  MIRON: "Solo mira, sin intención clara ni datos de contacto.",
  PREGUNTON: "Hace muchas preguntas, pero no avanza hacia la compra.",
  NEGOCIANTE: "Regatea, pide descuentos o busca revender.",
  CLIENTE_FINAL: "Quiere comprar: pide visita, financiamiento o reserva.",
};

export const LEAD_STATUS = ["NUEVO", "EN_SEGUIMIENTO", "CITA_AGENDADA", "CERRADO_GANADO", "CERRADO_PERDIDO"] as const;
export type LeadStatus = (typeof LEAD_STATUS)[number];
export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NUEVO: "Nuevo",
  EN_SEGUIMIENTO: "En seguimiento",
  CITA_AGENDADA: "Cita agendada",
  CERRADO_GANADO: "Cerrado (ganado)",
  CERRADO_PERDIDO: "Cerrado (perdido)",
};

export const BODY_TYPES = ["SUV", "Sedán", "Camioneta", "Hatchback", "Otro"] as const;
export type BodyType = (typeof BODY_TYPES)[number];
export const BODY_ART: Record<string, "suv" | "sedan" | "pickup"> = {
  SUV: "suv",
  Sedán: "sedan",
  Camioneta: "pickup",
  Hatchback: "sedan",
  Otro: "sedan",
};

export const VEHICLE_STATUS = ["AVAILABLE", "RESERVED", "SOLD"] as const;
export type VehicleStatus = (typeof VEHICLE_STATUS)[number];
export const VEHICLE_STATUS_LABEL: Record<VehicleStatus, string> = {
  AVAILABLE: "Disponible",
  RESERVED: "Reservado",
  SOLD: "Vendido",
};

export const DEFECT_CATEGORIES = ["PINTURA", "LLANTAS", "TAPIZADO", "VIDRIOS", "MECANICA", "OTRO"] as const;
export const DEFECT_CATEGORY_LABEL: Record<(typeof DEFECT_CATEGORIES)[number], string> = {
  PINTURA: "Pintura",
  LLANTAS: "Llantas",
  TAPIZADO: "Tapizado",
  VIDRIOS: "Vidrios",
  MECANICA: "Mecánica",
  OTRO: "Otro",
};
export const SEVERITIES = ["LEVE", "MODERADO"] as const;
export const SEVERITY_LABEL = { LEVE: "Leve", MODERADO: "Moderado" } as const;

export const RESERVATION_STATUS = ["PENDIENTE", "CONFIRMADA", "CANCELADA"] as const;

export const MOVEMENT_TYPES = ["INGRESO", "GASTO"] as const;
export type MovementType = (typeof MOVEMENT_TYPES)[number];

export const INCOME_CATEGORIES = ["VENTA_AUTO", "COMISION", "OTRO_INGRESO"] as const;
export const EXPENSE_CATEGORIES = [
  "COMPRA_AUTO", "REPARACION", "MANTENIMIENTO", "TRAMITES", "PUBLICIDAD",
  "SUELDOS", "ARRIENDO", "SERVICIOS", "IMPUESTOS", "COMISIONES", "OTRO_GASTO",
] as const;
export const MOVEMENT_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as const;
export const CATEGORY_LABEL: Record<string, string> = {
  VENTA_AUTO: "Venta de auto",
  COMISION: "Comisión cobrada",
  OTRO_INGRESO: "Otro ingreso",
  COMPRA_AUTO: "Compra de auto",
  REPARACION: "Reparación",
  MANTENIMIENTO: "Mantenimiento y limpieza",
  TRAMITES: "Trámites y matrícula",
  PUBLICIDAD: "Publicidad",
  SUELDOS: "Sueldos",
  ARRIENDO: "Arriendo del local",
  SERVICIOS: "Servicios básicos",
  IMPUESTOS: "Impuestos",
  COMISIONES: "Comisiones pagadas",
  OTRO_GASTO: "Otro gasto",
};
/** Gastos que cuentan como costo directo del auto (entran a la utilidad por auto). */
export const VEHICLE_COST_CATEGORIES = ["COMPRA_AUTO", "REPARACION", "MANTENIMIENTO", "TRAMITES", "COMISIONES"] as const;
