import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin } from "@/lib/auth";
import { createUploadTarget } from "@/lib/uploads";

export const dynamic = "force-dynamic";

const schema = z.object({
  kind: z.enum(["model", "image"]),
  ext: z.enum(["glb", "jpg", "png", "webp"]),
  size: z.number().int().positive(),
});

export async function POST(req: Request) {
  if (!(await getAdmin())) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  try {
    const t = await createUploadTarget(parsed.data.kind, parsed.data.ext, parsed.data.size);
    return NextResponse.json(t);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "No se pudo preparar la subida." }, { status: 400 });
  }
}
