import assert from "node:assert/strict";
import { classify, type Signals } from "./leadScoring";

const base: Signals = { userMessages: [], hasPhone: false, hasName: false, vehiclesViewed: 0, viewerOpens: 0, reserved: false };
const run = (over: Partial<Signals>) => classify({ ...base, ...over });

const cases: Array<[string, Partial<Signals>, string]> = [
  ["solo navega, sin escribir", { vehiclesViewed: 4 }, "MIRON"],
  ["un saludo y nada más", { userMessages: ["hola"] }, "MIRON"],
  [
    "muchas preguntas técnicas sin comprar",
    { userMessages: ["¿Qué consumo tiene?", "¿Y el mantenimiento es caro?", "¿Qué diferencia hay con el Tucson?", "¿Tiene garantía?", "¿Cuántos dueños ha tenido?"] },
    "PREGUNTON",
  ],
  [
    "pide descuento y menciona revender",
    { userMessages: ["Hola, cuál es el último precio de la Hilux?", "Si llevo dos autos me hace descuento? Los quiero para revender"] },
    "NEGOCIANTE",
  ],
  [
    "pide visita y deja teléfono",
    { userMessages: ["Quiero verlo este sábado, ¿a qué hora puedo ir?", "Mi número es 0991234567"], hasPhone: true, hasName: true },
    "CLIENTE_FINAL",
  ],
  ["reserva un auto", { userMessages: ["hola"], reserved: true }, "CLIENTE_FINAL"],
  [
    "regatea pero ya tiene teléfono y pide financiamiento (gana la compra)",
    { userMessages: ["Quiero comprar el Sportage, ¿hacen financiamiento?", "¿Me hace un descuento?"], hasPhone: true, hasName: true },
    "CLIENTE_FINAL",
  ],
  [
    "un solo 'descuento' sin más ya es negociante",
    { userMessages: ["¿Hay descuento en el Sail?"] },
    "NEGOCIANTE",
  ],
];

let failed = 0;
for (const [name, input, expected] of cases) {
  const r = run(input);
  try {
    assert.equal(r.segment, expected);
    console.log(`ok   ${name} -> ${r.segment}`);
  } catch {
    failed++;
    console.error(`FAIL ${name}: esperado ${expected}, salió ${r.segment}`, r.scores);
  }
}
if (failed) {
  console.error(`${failed} prueba(s) fallaron`);
  process.exit(1);
}
console.log(`\n${cases.length} pruebas de clasificación OK`);
