# Seguridad de ASTOREL

Revisión del 4 de noviembre de 2026. Resultado de las pruebas de ataque: 54 de 54 superadas.

## Lo que se probó
- Acceso al panel admin y a sus APIs sin sesión (todo rechazado).
- Sesiones falsas: firmadas con otra clave, vencidas y con algoritmo "none" (todas rechazadas).
- Fuerza bruta al login: se bloquea al octavo intento.
- Archivos sensibles (.env, package.json, schema, .git): no se exponen.
- XSS reflejado, inyección en rutas, métodos HTTP raros, CORS, cuerpos gigantes, SSRF por el optimizador de imágenes.
- Cabeceras de seguridad, caché de páginas privadas, robots.txt.
- Cookie de sesión: HttpOnly, Secure, SameSite=Strict, prefijo __Host-.
- Base de datos: RLS activo en todas las tablas, sin permisos para anon/authenticated, bucket con tope de tamaño y tipos.

## Pendiente (recomendado)
1. Verificación en dos pasos para el admin.
2. Contraseña larga y única; AUTH_SECRET de 32+ caracteres (openssl rand -base64 32).
3. Tope de gasto en la consola de Anthropic.
4. 2FA en GitHub, Vercel y Supabase.
5. Respaldos periódicos de la base.
6. Revisar los avisos semanales de Dependabot y actualizar.
7. La política CSP permite scripts en línea (necesario para Next sin nonces). Mejora futura: usar nonces.
