import assert from "node:assert/strict";
import { respond, extractPhone, extractBudget, extractName, type BotContext } from "./bot";

const ctx: BotContext = {
  patioName: "Patio Test",
  known: {},
  vehicles: [
    { id: "1", slug: "kia-sportage", brand: "Kia", model: "Sportage", year: 2019, km: 48200, priceCents: 1990000, bodyType: "SUV", status: "AVAILABLE" },
    { id: "2", slug: "chevrolet-sail", brand: "Chevrolet", model: "Sail", year: 2021, km: 31500, priceCents: 1280000, bodyType: "Sedán", status: "AVAILABLE" },
    { id: "3", slug: "toyota-hilux", brand: "Toyota", model: "Hilux", year: 2018, km: 92000, priceCents: 2750000, bodyType: "Camioneta", status: "SOLD" },
  ],
};

assert.equal(extractPhone("mi cel es 099 123 4567"), "0991234567");
assert.equal(extractPhone("+593 98 765 4321"), "0987654321");
assert.equal(extractPhone("tengo 12345"), undefined);
assert.equal(extractBudget("tengo 15 mil"), 15000);
assert.equal(extractBudget("hasta $18.000"), 18000);
assert.equal(extractBudget("el 2019 tiene 100"), undefined);
assert.equal(extractName("hola me llamo maría pérez"), "María Pérez");
assert.equal(extractName("soy de Quito"), undefined);

const sedan = respond("busco un sedán hasta 14 mil", ctx);
assert.match(sedan.reply, /Sail/);
assert.doesNotMatch(sedan.reply, /Sportage/);

const sold = respond("cuanto vale la Hilux", ctx);
assert.doesNotMatch(sold.reply, /\$27/); // un auto vendido no se ofrece

const nego = respond("me hace un descuento?", ctx);
assert.match(nego.reply, /asesor/);
assert.doesNotMatch(nego.reply, /%/); // nunca promete rebajas

const contact = respond("Soy Juan, mi cel 0991234567", ctx);
assert.equal(contact.extracted.phone, "0991234567");
assert.equal(contact.extracted.name, "Juan");

const none = respond("busco un sedán hasta 5 mil", ctx);
assert.match(none.reply, /no tengo/i);

console.log("pruebas del bot OK");
