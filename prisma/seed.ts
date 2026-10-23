import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { classify } from "../src/lib/leadScoring";

const db = new PrismaClient();

type D = { zone: string; detail: string; category: string; severity: string; posX: number; posY: number; posZ: number };
type L = { label: string; value: string; status: string };
const okLegal = (techUntil: string, fine?: string): L[] => [
  { label: "Matrícula", value: "Vigente 2026", status: "OK" },
  { label: "Gravámenes", value: "Ninguno", status: "OK" },
  { label: "Multas", value: fine ?? "$0", status: fine ? "WARN" : "OK" },
  { label: "Revisión técnica", value: `Vigente hasta ${techUntil}`, status: "OK" },
];

const cars = [
  { slug: "kia-sportage-2019", brand: "Kia", model: "Sportage", version: "2.0 GLS", year: 2019, km: 48200, price: 19900, bodyType: "SUV", color: "Gris grafito", hex: "#5b6169",
    defects: [
      { zone: "Puerta delantera izquierda", detail: "Rayón superficial de 8 cm", category: "PINTURA", severity: "LEVE", posX: -0.5, posY: 0, posZ: 0.12 },
      { zone: "Llanta trasera derecha", detail: "Desgaste irregular en el borde", category: "LLANTAS", severity: "MODERADO", posX: 0.5, posY: -0.4, posZ: -0.3 },
    ] as D[], legal: okLegal("03/2027") },
  { slug: "chevrolet-sail-2021", brand: "Chevrolet", model: "Sail", version: "1.5 LS", year: 2021, km: 31500, price: 12800, bodyType: "Sedán", color: "Blanco", hex: "#d9dadd",
    defects: [] as D[], legal: okLegal("08/2027") },
  { slug: "toyota-hilux-2018", brand: "Toyota", model: "Hilux", version: "4x4 SR", year: 2018, km: 92000, price: 27500, bodyType: "Camioneta", color: "Rojo oscuro", hex: "#8e1b22",
    defects: [
      { zone: "Parachoques trasero", detail: "Golpe leve con pintura saltada", category: "PINTURA", severity: "MODERADO", posX: 0.1, posY: -0.3, posZ: -0.5 },
      { zone: "Asiento del conductor", detail: "Desgaste del tapiz en el costado", category: "TAPIZADO", severity: "LEVE", posX: -0.2, posY: 0.15, posZ: 0.05 },
      { zone: "Capó", detail: "Pequeños puntos de óxido", category: "PINTURA", severity: "LEVE", posX: 0, posY: 0.1, posZ: 0.45 },
    ] as D[], legal: okLegal("11/2026", "Pendiente $42") },
  { slug: "hyundai-tucson-2020", brand: "Hyundai", model: "Tucson", version: "2.0 GL", year: 2020, km: 39800, price: 23400, bodyType: "SUV", color: "Azul noche", hex: "#1f3a6b",
    defects: [{ zone: "Parachoques delantero", detail: "Raspón de 5 cm en la esquina", category: "PINTURA", severity: "LEVE", posX: -0.4, posY: -0.3, posZ: 0.5 }] as D[], legal: okLegal("05/2027") },
  { slug: "mazda-3-2017", brand: "Mazda", model: "3", version: "2.0 Touring", year: 2017, km: 66700, price: 14900, bodyType: "Sedán", color: "Plata", hex: "#b9bec5",
    defects: [
      { zone: "Techo", detail: "Pintura opaca por el sol", category: "PINTURA", severity: "LEVE", posX: 0, posY: 0.5, posZ: 0 },
      { zone: "Llanta delantera izquierda", detail: "Rin con rozadura", category: "LLANTAS", severity: "LEVE", posX: -0.5, posY: -0.4, posZ: 0.3 },
    ] as D[], legal: okLegal("01/2027") },
  { slug: "chevrolet-d-max-2016", brand: "Chevrolet", model: "D-Max", version: "3.0 CD", year: 2016, km: 118000, price: 17200, bodyType: "Camioneta", color: "Negro", hex: "#1c1c1e",
    defects: [
      { zone: "Puerta trasera derecha", detail: "Abolladura de 6 cm", category: "PINTURA", severity: "MODERADO", posX: 0.5, posY: 0, posZ: -0.2 },
      { zone: "Asiento trasero", detail: "Mancha que no sale", category: "TAPIZADO", severity: "LEVE", posX: 0, posY: 0.1, posZ: -0.15 },
    ] as D[], legal: okLegal("09/2027") },
];

// Conversaciones de ejemplo: el segmento sale del mismo motor que usa el chatbot.
const sampleLeads: Array<{ name?: string; phone?: string; viewed: number; opens: number; msgs: string[]; carSlug: string }> = [
  { viewed: 5, opens: 0, msgs: [], carSlug: "kia-sportage-2019" },
  { viewed: 2, opens: 1, msgs: ["hola", "cuanto cuesta el Sail?"], carSlug: "chevrolet-sail-2021" },
  { viewed: 4, opens: 2, msgs: ["¿Qué consumo tiene la Sportage?", "¿Y el mantenimiento es caro?", "¿Tiene garantía?", "¿Cuántos dueños ha tenido?", "¿Qué diferencia hay con el Tucson?"], carSlug: "kia-sportage-2019" },
  { viewed: 3, opens: 1, msgs: ["¿Cuál es el último precio de la Hilux?", "Si llevo dos autos me hace descuento? Es para revender"], carSlug: "toyota-hilux-2018" },
  { name: "Carolina Vera", phone: "0991234567", viewed: 6, opens: 3, msgs: ["Quiero verlo este sábado, ¿a qué hora puedo ir?", "Soy Carolina, mi cel 0991234567", "¿Hacen financiamiento?"], carSlug: "hyundai-tucson-2020" },
];

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@patio.local").toLowerCase();
  let password = process.env.ADMIN_PASSWORD || "";
  const generated = !password;
  if (generated) password = randomBytes(9).toString("base64url");
  const admin = await db.admin.findUnique({ where: { email } });
  if (!admin) {
    await db.admin.create({ data: { email, passwordHash: await bcrypt.hash(password, 10) } });
    console.log(`Admin creado: ${email}${generated ? `  contraseña generada: ${password}  (guárdala, no se vuelve a mostrar)` : ""}`);
  } else {
    console.log(`Admin ${email} ya existe; no se tocó su contraseña.`);
  }

  if ((await db.vehicle.count()) > 0) {
    console.log("Ya hay autos cargados; el seed no duplica datos de ejemplo.");
    return;
  }

  for (const c of cars) {
    await db.vehicle.create({
      data: {
        slug: c.slug, brand: c.brand, model: c.model, version: c.version, year: c.year, km: c.km, priceCents: c.price * 100,
        bodyType: c.bodyType, color: c.color, hex: c.hex,
        description: `${c.brand} ${c.model} ${c.year}, ${c.color.toLowerCase()}. Revisado en el patio; los detalles marcados se ven en el modelo 3D.`,
        defects: { create: c.defects }, legal: { create: c.legal },
      },
    });
  }

  const bySlug = new Map((await db.vehicle.findMany({ select: { id: true, slug: true } })).map((v) => [v.slug, v.id]));
  for (const s of sampleLeads) {
    const r = classify({ userMessages: s.msgs, hasPhone: Boolean(s.phone), hasName: Boolean(s.name), vehiclesViewed: s.viewed, viewerOpens: s.opens, reserved: false });
    await db.lead.create({
      data: {
        name: s.name ?? null, phone: s.phone ?? null, vehicleId: bySlug.get(s.carSlug) ?? null, vehiclesViewed: s.viewed, viewerOpens: s.opens,
        segment: r.segment, score: r.score, reasons: JSON.stringify(r.reasons),
        sessions: s.msgs.length ? { create: { messages: { create: s.msgs.map((content) => ({ role: "user", content })) } } } : undefined,
      },
    });
  }
  // Libro contable de ejemplo (fechas relativas a hoy para que siempre haya datos recientes).
  const id = (slug: string) => bySlug.get(slug) ?? null;
  const day = (monthsAgo: number, dom: number) => new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - monthsAgo, dom, 12));
  const mv = (type: string, category: string, usd: number, d: Date, slug: string | null, description: string) =>
    ({ type, category, amountCents: usd * 100, date: d, vehicleId: slug ? id(slug) : null, description });
  await db.movement.createMany({
    data: [
      mv("GASTO", "COMPRA_AUTO", 16800, day(3, 4), "kia-sportage-2019", "Compra a particular"),
      mv("GASTO", "REPARACION", 450, day(3, 12), "kia-sportage-2019", "Pulida y retoque de pintura"),
      mv("GASTO", "COMPRA_AUTO", 10200, day(3, 6), "chevrolet-sail-2021", "Compra a particular"),
      mv("GASTO", "COMPRA_AUTO", 23500, day(2, 3), "toyota-hilux-2018", "Compra en remate"),
      mv("GASTO", "REPARACION", 1100, day(2, 9), "toyota-hilux-2018", "Parachoques y tapiz"),
      mv("GASTO", "COMPRA_AUTO", 12100, day(2, 15), "mazda-3-2017", "Compra a particular"),
      mv("GASTO", "TRAMITES", 280, day(2, 18), "mazda-3-2017", "Matrícula y traspaso"),
      mv("INGRESO", "VENTA_AUTO", 20400, day(2, 20), "kia-sportage-2019", "Venta de contado"),
      mv("INGRESO", "VENTA_AUTO", 10900, day(1, 8), "chevrolet-sail-2021", "Venta con crédito"),
      mv("GASTO", "COMISIONES", 300, day(1, 8), "chevrolet-sail-2021", "Comisión del vendedor"),
      ...[3, 2, 1, 0].map((m) => mv("GASTO", "ARRIENDO", 900, day(m, 1), null, "Arriendo del local")),
      ...[3, 2, 1, 0].map((m) => mv("GASTO", "SUELDOS", 1200, day(m, 28 > new Date().getUTCDate() && m === 0 ? 1 : 28), null, "Sueldo del asesor")),
      ...[3, 2, 1, 0].map((m) => mv("GASTO", "SERVICIOS", 140, day(m, 5), null, "Luz, agua e internet")),
      mv("GASTO", "PUBLICIDAD", 350, day(2, 10), null, "Anuncios en redes"),
      mv("GASTO", "PUBLICIDAD", 520, day(0, 2), null, "Anuncios y fotos profesionales"),
    ],
  });
  console.log(`Cargados ${cars.length} autos y ${sampleLeads.length} clientes de ejemplo.`);
}

main().finally(() => db.$disconnect());
