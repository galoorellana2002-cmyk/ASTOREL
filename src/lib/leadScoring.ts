import type { Segment } from "./constants";

export interface Signals {
  /** Mensajes escritos por el cliente, en orden. */
  userMessages: string[];
  hasPhone: boolean;
  hasName: boolean;
  /** Autos distintos que vio en la tienda. */
  vehiclesViewed: number;
  /** Veces que abrió el visor 3D. */
  viewerOpens: number;
  /** Pidió reservar un auto. */
  reserved: boolean;
}

export interface Classification {
  segment: Segment;
  score: number;
  scores: Record<Segment, number>;
  reasons: string[];
}

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Frases que indican que quiere regatear o revender.
const NEGOCIANTE = [
  /\bdescuento/,
  /\brebaja/,
  /\bultimo precio/,
  /\bmejor precio/,
  /\bprecio final/,
  /\bcuanto menos/,
  /\bmenos de\b/,
  /\bnegociable/,
  /\bnegociar/,
  /\bmayoreo|por mayor/,
  /\bvarios (autos|carros|vehiculos|unidades)/,
  /\brevend|\breventa/,
  /\bcomision/,
  /\bdealer|concesionari/,
  /\ble doy \$?\d|\bofrezco|\bofertar?\b/,
  /\bmi ultima oferta|\bpuedo pagar (maximo|hasta)/,
];

// Frases que indican intención de compra real.
const CLIENTE_FINAL = [
  /\bquiero (comprar|verlo|ir|reservar|agendar|probar)/,
  /\bagendar|\bagendo\b/,
  /\bcita\b/,
  /\bvisita|\bvisitarlos|\bir a verlo/,
  /\bprueba de (manejo|ruta)|test drive|\bprobarlo/,
  /\breserv(ar|o|a|acion)\b/,
  /\bapartar|\bseparar\b/,
  /\bfinanci|\bcredito|\bcuota|\bentrada\b/,
  /\btraspaso|\bmatricul|\bpapeles|\btramites?\b/,
  /\bcuando puedo (ir|verlo|pasar)|\ba que hora|\bhorario\b/,
  /\bdonde (esta|queda|estan)|\bdireccion|\bubicacion/,
  /\blo compro|\bme lo llevo|\bme interesa comprar|\bestoy decidido/,
  /\bparte de pago|\brecibe(n)? (mi )?(auto|carro|vehiculo)/,
];

// Preguntas de ficha técnica: típicas de quien investiga.
const SPEC_QUESTIONS = [
  /\bconsumo|\brendimiento|\bgalon/,
  /\bmantenimiento|\brepuestos?/,
  /\bgarantia/,
  /\bmotor|\bcilindr|\bcaja\b|\bturbo|\btraccion/,
  /\bdiferencia|\bcompar|\bmejor (que|entre)/,
  /\bcuantos (duenos|propietarios|kilometros|km)/,
  /\bcolor|\binterior|\basientos|\bairbag|\bcamara/,
];

const QUESTION_START = /^(cuanto|cual|cuales|que|como|donde|cuando|quien|tiene|tienen|hay|sirve|puede|pueden|es |son |viene|incluye|trae)\b/;

export function countQuestions(messages: string[]): number {
  return messages.reduce((n, m) => {
    const t = normalize(m).trim();
    return n + (t.includes("?") || QUESTION_START.test(t) ? 1 : 0);
  }, 0);
}

function hits(patterns: RegExp[], messages: string[]): number {
  const text = messages.map(normalize);
  return patterns.reduce((n, p) => n + (text.some((t) => p.test(t)) ? 1 : 0), 0);
}

export function classify(s: Signals): Classification {
  const msgs = s.userMessages;
  const negoHits = hits(NEGOCIANTE, msgs);
  const finalHits = hits(CLIENTE_FINAL, msgs);
  const specHits = hits(SPEC_QUESTIONS, msgs);
  const questions = countQuestions(msgs);
  const reasons: string[] = [];

  let final = finalHits * 3;
  if (finalHits) reasons.push(`Señales de compra en ${finalHits} ${finalHits === 1 ? "frase" : "frases"} (visita, financiamiento, reserva, trámites).`);
  if (s.hasPhone) { final += 2; reasons.push("Dejó su teléfono."); }
  if (s.hasName) { final += 1; reasons.push("Dio su nombre."); }
  if (s.viewerOpens >= 2) { final += 1; reasons.push("Abrió el visor 3D varias veces."); }
  if (s.reserved) { final += 6; reasons.push("Pidió reservar un auto."); }

  const nego = negoHits * 3;
  if (negoHits) reasons.push(`Lenguaje de negociación en ${negoHits} ${negoHits === 1 ? "frase" : "frases"} (descuento, último precio, reventa).`);

  let preg = Math.max(0, questions - 2) + (specHits >= 3 ? 2 : specHits >= 2 ? 1 : 0);
  if (questions >= 3) reasons.push(`Hizo ${questions} preguntas${specHits ? `, ${specHits} de ficha técnica` : ""}.`);

  let miron = 0;
  if (msgs.length <= 2) miron += 2;
  if (!s.hasPhone) miron += 1;
  if (s.vehiclesViewed >= 3 && msgs.length <= 1) miron += 2;
  if (msgs.length === 0) reasons.push("Solo navegó, sin escribir.");
  else if (msgs.length <= 2 && !finalHits && !negoHits) reasons.push("Pocos mensajes y sin intención clara.");

  const scores: Record<Segment, number> = { MIRON: miron, PREGUNTON: preg, NEGOCIANTE: nego, CLIENTE_FINAL: final };

  let segment: Segment;
  if (s.reserved) segment = "CLIENTE_FINAL";
  else if (final >= 4 && final >= nego) segment = "CLIENTE_FINAL";
  else if (nego >= 3 && nego > final) segment = "NEGOCIANTE";
  else if (preg >= 3) segment = "PREGUNTON";
  else segment = "MIRON";

  return { segment, score: scores[segment], scores, reasons: Array.from(new Set(reasons)) };
}
