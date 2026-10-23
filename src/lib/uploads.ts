import "server-only";
import { randomUUID } from "node:crypto";
import { BUCKET, publicBase, supabaseAdmin } from "./storage";

export type Kind = "model" | "image";
export const LIMITS: Record<Kind, number> = { model: 50 * 1024 * 1024, image: 6 * 1024 * 1024 };
const EXTS: Record<Kind, string[]> = { model: ["glb"], image: ["jpg", "png", "webp"] };

/** Valida por contenido (bytes iniciales), no por lo que diga el nombre o el tipo. */
function detectExt(kind: Kind, head: Uint8Array): string | null {
  const starts = (...b: number[]) => b.every((v, i) => head[i] === v);
  if (kind === "model") return starts(0x67, 0x6c, 0x54, 0x46) ? "glb" : null; // "glTF"
  if (starts(0xff, 0xd8, 0xff)) return "jpg";
  if (starts(0x89, 0x50, 0x4e, 0x47)) return "png";
  if (starts(0x52, 0x49, 0x46, 0x46) && head[8] === 0x57 && head[9] === 0x45) return "webp";
  return null;
}

/**
 * El navegador sube el archivo directo a Supabase (Vercel limita el cuerpo de las
 * funciones a ~4.5 MB). Aquí solo se crea una URL firmada de un solo uso.
 */
export async function createUploadTarget(kind: Kind, ext: string, size: number) {
  if (!EXTS[kind].includes(ext)) throw new Error(kind === "model" ? "El modelo debe ser un archivo .glb." : "La imagen debe ser JPG, PNG o WebP.");
  if (!(size > 0)) throw new Error("El archivo está vacío.");
  if (size > LIMITS[kind]) throw new Error(`El archivo supera el máximo de ${LIMITS[kind] / 1024 / 1024} MB.`);
  const sb = supabaseAdmin();
  // Crea el bucket público la primera vez (si ya existe, se ignora el error).
  await sb.storage.createBucket(BUCKET, { public: true }).catch(() => undefined);
  const path = `${kind}/${randomUUID()}.${ext}`;
  const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error || !data) throw new Error("No se pudo preparar la subida del archivo.");
  return { path, signedUrl: data.signedUrl, publicUrl: publicBase() + path };
}

function pathOf(url: string | null | undefined): string | null {
  if (!url) return null;
  const base = publicBase();
  if (!url.startsWith(base)) return null;
  const p = url.slice(base.length);
  return /^(model|image)\/[0-9a-f-]{36}\.(glb|jpg|png|webp)$/.test(p) ? p : null;
}

/** Confirma que la URL es de nuestro bucket y que el contenido real es del tipo esperado. */
export async function verifyUpload(url: string, kind: Kind): Promise<void> {
  const p = pathOf(url);
  if (!p || !p.startsWith(`${kind}/`)) throw new Error("Archivo no válido.");
  const res = await fetch(url, { headers: { Range: "bytes=0-11" }, cache: "no-store" });
  if (!res.ok) throw new Error("No se encontró el archivo subido. Vuelve a intentarlo.");
  const head = new Uint8Array(await res.arrayBuffer()).subarray(0, 12);
  if (!detectExt(kind, head)) {
    await removeUpload(url);
    throw new Error(kind === "model" ? "El modelo debe ser un archivo .glb válido." : "La imagen debe ser JPG, PNG o WebP.");
  }
}

/** Borra un archivo subido antes. Solo acepta URLs de nuestro bucket. */
export async function removeUpload(url: string | null | undefined): Promise<void> {
  const p = pathOf(url);
  if (!p) return;
  await supabaseAdmin().storage.from(BUCKET).remove([p]).catch(() => undefined);
}
