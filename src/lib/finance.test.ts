import assert from "node:assert/strict";
import { parseDay, summarize, type Mov, type Veh } from "./finance";

const d = parseDay;
const veh: Veh[] = [
  { id: "a", label: "Kia Sportage 2019", status: "SOLD" },
  { id: "b", label: "Sail 2021", status: "SOLD" },
  { id: "c", label: "Hilux 2018", status: "AVAILABLE" },
  { id: "d", label: "Mazda 3 2017", status: "SOLD" },
];
const movs: Mov[] = [
  { type: "GASTO", category: "COMPRA_AUTO", amountCents: 1_500_000, date: d("2026-07-02"), vehicleId: "a" },
  { type: "GASTO", category: "REPARACION", amountCents: 100_000, date: d("2026-07-10"), vehicleId: "a" },
  { type: "INGRESO", category: "VENTA_AUTO", amountCents: 1_900_000, date: d("2026-08-05"), vehicleId: "a" },
  { type: "GASTO", category: "COMPRA_AUTO", amountCents: 1_000_000, date: d("2026-07-03"), vehicleId: "b" },
  { type: "GASTO", category: "REPARACION", amountCents: 300_000, date: d("2026-07-04"), vehicleId: "b" },
  { type: "INGRESO", category: "VENTA_AUTO", amountCents: 1_200_000, date: d("2026-09-01"), vehicleId: "b" },
  { type: "GASTO", category: "COMPRA_AUTO", amountCents: 2_000_000, date: d("2026-09-02"), vehicleId: "c" },
  { type: "INGRESO", category: "VENTA_AUTO", amountCents: 1_300_000, date: d("2026-09-20"), vehicleId: "d" }, // sin compra
  { type: "GASTO", category: "ARRIENDO", amountCents: 80_000, date: d("2026-07-01"), vehicleId: null },
  { type: "GASTO", category: "ARRIENDO", amountCents: 80_000, date: d("2026-08-01"), vehicleId: null },
  { type: "GASTO", category: "PUBLICIDAD", amountCents: 20_000, date: d("2026-09-01"), vehicleId: null },
];
const s = summarize(movs, veh);

assert.equal(s.incomeCents, 4_400_000);
assert.equal(s.expenseCents, 5_080_000);
assert.equal(s.cashCents, -680_000);
// Kia: 1.9M - 1.6M = 300k ; Sail: 1.2M - 1.3M = -100k ; Mazda sin costo -> no cuenta
assert.equal(s.salesProfitCents, 200_000);
assert.equal(s.operatingCents, 180_000);
assert.equal(s.netCents, 20_000);
assert.equal(s.stockCents, 2_000_000);
assert.equal(s.vehicles.find((v) => v.vehicleId === "d")?.missingCost, true);
assert.equal(s.vehicles.find((v) => v.vehicleId === "b")?.profitCents, -100_000);
assert.equal(s.expensesByCategory[0]?.category, "COMPRA_AUTO");
assert.deepEqual(s.byMonth.map((m) => m.key), ["2026-07", "2026-08", "2026-09"]);
assert.ok(s.insights.some((t) => t.includes("Sail 2021") && t.includes("pérdida")));
assert.ok(s.insights.some((t) => t.includes("Mazda 3 2017") && t.includes("Falta registrar")));

const empty = summarize([], veh);
assert.equal(empty.netCents, 0);
assert.equal(empty.marginPct, null);
console.log("finance: OK");
