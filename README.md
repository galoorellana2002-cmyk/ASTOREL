# ASTOREL

Tienda de autos usados con **visor 3D**, defectos marcados sobre el modelo, ficha legal, **chatbot de captación**, **clasificación de clientes** (mirón, preguntón, negociante, cliente final) y **panel administrativo**.

Stack: Next.js 14 (React 18, App Router) · TypeScript · Prisma · PostgreSQL (Supabase) · Supabase Storage · `<model-viewer>` para el 3D.

## Puesta en marcha

```bash
npm install
cp .env.example .env        # edita AUTH_SECRET (openssl rand -base64 32) y la clave del admin
npx prisma db push          # crea la base de datos
npm run db:seed             # admin + 6 autos y 5 clientes de ejemplo
npm run dev                 # http://localhost:3000
```

- Tienda: `http://localhost:3000` · Panel: `http://localhost:3000/admin` (usuario y clave del `.env`; si dejas `ADMIN_PASSWORD` vacío, el seed genera una y la imprime una sola vez).
- `npm run typecheck` · `npm test` (pruebas de clasificación) · `npx tsx src/lib/bot.test.ts` (pruebas del bot) · `npm run db:studio` (ver la base).

## Estructura

```
prisma/schema.prisma        Vehicle, Defect, LegalCheck, Lead, ChatSession/Message, Reservation, Movement (finanzas), Admin
prisma/seed.ts              datos de ejemplo (los clientes se clasifican con el mismo motor del bot)
src/app/(site)/             tienda pública: inicio, /autos, /autos/[slug]
src/app/admin/              login + panel (resumen, autos, clientes, reservas) y server actions
src/app/api/chat/route.ts   endpoint del chatbot
src/lib/leadScoring.ts      motor de clasificación de clientes (puro, con pruebas)
src/lib/bot.ts              respuestas del bot: reglas locales + Claude opcional
src/components/             Hero, visor 3D (Viewer3D), chat, formularios
```

## Finanzas (panel → Finanzas)

Libro de ingresos y gastos (`Movement`). Cada movimiento tiene tipo, categoría, monto, fecha y, opcionalmente, el auto al que pertenece (compra, reparación, venta).

- **Flujo de caja** = ingresos − gastos. **Utilidad real** = utilidad de autos vendidos (venta − costos directos del auto) − gastos generales (arriendo, sueldos, publicidad…). El dinero metido en autos sin vender se muestra aparte: no es pérdida.
- Registrar una venta marca el auto como vendido en la tienda.
- **Reporte SVG** (`/admin/export/svg?period=anio`) con gastos por categoría, ingresos vs gastos por mes, resultado por auto y observaciones; también **CSV** (`/admin/export/csv`).
- **Asistente de IA**: con `ANTHROPIC_API_KEY` responde preguntas libres usando solo tus cifras (modelo en `FINANCE_MODEL`); sin clave muestra el análisis calculado por reglas. No reemplaza a un contador (SRI, IVA, renta).
- Cálculos con pruebas: `npx tsx src/lib/finance.test.ts`.

## Cómo se clasifica a un cliente

Cada visitante que escribe en el chat es un `Lead`. En cada mensaje se recalcula su segmento con `classify()`:

| Segmento | Señales |
|---|---|
| **Cliente final** | pide visita, prueba de manejo, financiamiento, trámites; deja teléfono o nombre; reserva (una reserva lo fija como cliente final) |
| **Negociante** | pide descuento, "último precio", menciona reventa, varios autos, ofertas |
| **Preguntón** | 3 o más preguntas, sobre todo de ficha técnica (consumo, mantenimiento, garantía), sin señales de compra |
| **Mirón** | pocos mensajes, sin contacto ni intención |

Si hay señales mezcladas, gana compra sobre negociación. Cada cliente guarda las **razones** de su clasificación (se ven en el panel). Desde el panel puedes corregir el segmento y **fijarlo** para que el sistema no lo recalcule. Las frases están en `src/lib/leadScoring.ts`: ajústalas con lo que de verdad escriben tus clientes.

## Modelos 3D

En el panel, en cada auto, sube el `.glb` (hasta 50 MB; se valida por contenido, no por la extensión). Exporta el escaneo desde Scaniverse, Polycam o RealityScan como **GLB**. Los defectos se posicionan con tres números (X, Y, Z entre -0,5 y 0,5 respecto al centro del modelo): pruébalos en la página del auto hasta que el punto caiga donde está el daño.

## Chatbot con Claude (opcional)

Sin configuración usa reglas locales (precios, búsqueda por tipo y presupuesto, captación de contacto; nunca promete descuentos). Si defines `ANTHROPIC_API_KEY` en `.env`, la redacción de las respuestas la hace Claude con el inventario real, y las reglas siguen extrayendo contacto y clasificando. Si la API falla, cae a las reglas.

## Antes de publicar en producción

- `AUTH_SECRET` único y largo; cambia la clave del admin.
- Base de datos: pasa a PostgreSQL (cambia `provider` y `DATABASE_URL` en `schema.prisma`, luego `npx prisma db push`).
- Archivos: hoy se guardan en `public/uploads` (sirve en un servidor propio o VPS). En Vercel o similar usa almacenamiento externo (Cloudflare R2, S3) y adapta `src/lib/uploads.ts`.
- Los límites de intentos (login, chat, reservas) están en memoria: con varias instancias usa Redis o Upstash.
- Privacidad: el chat guarda nombre y teléfono. Agrega un aviso de privacidad según la LOPDP (Ecuador) antes de captar datos reales.
- La fuente Barlow se carga desde Google Fonts; el visor usa `@google/model-viewer` desde el propio paquete.
