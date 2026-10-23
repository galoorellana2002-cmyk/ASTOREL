# Publicar ASTOREL: Supabase + Vercel + dominio

## 1. Crear el proyecto en Supabase
1. Entra a https://supabase.com, crea una cuenta y un **New project** (región cercana: `South America (São Paulo)`). Guarda la **Database password**.
2. Arriba, botón **Connect** → pestaña **ORMs / Prisma**: copia las dos cadenas.
   - `DATABASE_URL`: la del *pooler* (puerto **6543**). Agrega al final `?pgbouncer=true&connection_limit=1`.
   - `DIRECT_URL`: la directa (puerto **5432**).
   Reemplaza `[YOUR-PASSWORD]` por tu clave de base de datos (si tiene símbolos como `@` o `#`, escríbelos codificados: `%40`, `%23`).
3. **Project Settings → API**: copia
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (secreta).
   El bucket de fotos y modelos (`vehiculos`, público) se crea solo la primera vez que subas un archivo.

## 2. Probarlo en tu Mac
1. Abre `.env` y cambia/añade las variables de `.env.example` (borra la línea vieja `DATABASE_URL="file:./dev.db"`).
2. En la terminal del proyecto:
   ```
   npm install
   npx prisma db push
   npm run db:seed      # opcional: autos y movimientos de ejemplo + usuario admin
   npm run dev
   ```
3. Entra a http://localhost:3000/admin, crea o edita un auto y sube una foto y un `.glb`. Deben verse en la tienda.

## 3. Subir el código a GitHub
Crea un repositorio **privado** y sube el proyecto. El archivo `.env` NO se sube (ya está en `.gitignore`).

## 4. Publicar en Vercel
1. https://vercel.com → **Add New → Project** → importa el repositorio.
2. En **Environment Variables** pega las mismas del `.env`:
   `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`,
   `AUTH_SECRET` (usa uno nuevo y largo), `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   `NEXT_PUBLIC_PATIO_NAME`, `NEXT_PUBLIC_WHATSAPP`, `ANTHROPIC_API_KEY`, `CHAT_MODEL`, `FINANCE_MODEL`.
3. **Deploy**. Después ejecuta `npm run db:seed` desde tu Mac apuntando a esa misma base si quieres crear el usuario admin en producción (o crea el admin con tu `ADMIN_EMAIL`/`ADMIN_PASSWORD` y el seed).

## 5. Dominio
1. Compra el dominio (astorel.ec o astorel.com).
2. Vercel → proyecto → **Settings → Domains** → agrega el dominio.
3. Vercel te muestra los registros DNS (A y CNAME): cópialos en el panel de tu registrador. En minutos u horas activa HTTPS solo.

## Notas
- **Plan de Vercel:** el plan gratuito (Hobby) está pensado para uso personal/no comercial. Para el negocio, revisa los términos vigentes; el plan Pro es el comercial.
- **Límites de uso (chat y asistente):** el control de peticiones por minuto vive en memoria de cada instancia; en Vercel es un freno básico, no estricto.
- **Copias de seguridad:** en Supabase, **Database → Backups** (el plan gratuito no incluye copias descargables diarias; exporta los datos de vez en cuando).
- **Seguridad:** nunca pongas `SUPABASE_SERVICE_ROLE_KEY` en variables que empiecen con `NEXT_PUBLIC_`.
