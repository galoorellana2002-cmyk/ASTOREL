import "server-only";
import { createClient } from "@supabase/supabase-js";

export const BUCKET = process.env.SUPABASE_BUCKET || "vehiculos";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Falta configurar Supabase (NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY).");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function publicBase(): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
}
