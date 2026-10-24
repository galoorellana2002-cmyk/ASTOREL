"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveVehicle, type FormState } from "@/app/admin/actions";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/card";
import { Check, Field, Input, Select, Textarea } from "@/components/ui/input";
import { ErrorNote } from "@/components/admin/ui";
import { BODY_TYPES, DEFECT_CATEGORIES, DEFECT_CATEGORY_LABEL, SEVERITIES, SEVERITY_LABEL, VEHICLE_STATUS, VEHICLE_STATUS_LABEL } from "@/lib/constants";

interface DefectRow { zone: string; detail: string; category: string; severity: string; posX: number; posY: number; posZ: number }
interface LegalRow { label: string; value: string; status: string }
export interface VehicleFormData {
  id: string; brand: string; model: string; version: string; year: number; km: number; priceUsd: number; bodyType: string; color: string; hex: string;
  description: string; status: string; published: boolean; modelUrl: string | null; coverUrl: string | null; defects: DefectRow[]; legal: LegalRow[];
}

const DEFAULT_LEGAL: LegalRow[] = [
  { label: "Matrícula", value: "Vigente", status: "OK" },
  { label: "Gravámenes", value: "Ninguno", status: "OK" },
  { label: "Multas", value: "$0", status: "OK" },
  { label: "Revisión técnica", value: "Vigente", status: "OK" },
];

function Submit({ editing, busy }: { editing: boolean; busy: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || busy}>
      {busy ? "Subiendo archivo…" : pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear auto"}
    </Button>
  );
}

type Kind = "model" | "image";
const MAX: Record<Kind, number> = { model: 50 * 1024 * 1024, image: 6 * 1024 * 1024 };

function extOf(kind: Kind, head: Uint8Array): string | null {
  const s = (...b: number[]) => b.every((v, i) => head[i] === v);
  if (kind === "model") return s(0x67, 0x6c, 0x54, 0x46) ? "glb" : null;
  if (s(0xff, 0xd8, 0xff)) return "jpg";
  if (s(0x89, 0x50, 0x4e, 0x47)) return "png";
  if (s(0x52, 0x49, 0x46, 0x46) && head[8] === 0x57 && head[9] === 0x45) return "webp";
  return null;
}

/** Sube el archivo directo a Supabase Storage con una URL firmada y devuelve su URL pública. */
async function uploadDirect(file: File, kind: Kind): Promise<string> {
  if (file.size > MAX[kind]) throw new Error(`El archivo supera el máximo de ${MAX[kind] / 1024 / 1024} MB.`);
  const ext = extOf(kind, new Uint8Array(await file.slice(0, 12).arrayBuffer()));
  if (!ext) throw new Error(kind === "model" ? "El modelo debe ser un archivo .glb válido." : "La imagen debe ser JPG, PNG o WebP.");
  const r = await fetch("/api/admin/upload-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, ext, size: file.size }) });
  const t = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(t.error || "No se pudo preparar la subida.");
  const body = new FormData();
  body.append("cacheControl", "31536000");
  body.append("", file);
  const up = await fetch(t.signedUrl, { method: "PUT", body });
  if (!up.ok) throw new Error("No se pudo subir el archivo. Vuelve a intentarlo.");
  return t.publicUrl as string;
}

export function VehicleForm({ vehicle }: { vehicle?: VehicleFormData }) {
  const [state, action] = useFormState<FormState, FormData>(saveVehicle, {});
  const [defects, setDefects] = useState<DefectRow[]>(vehicle?.defects ?? []);
  const [legal, setLegal] = useState<LegalRow[]>(vehicle?.legal ?? DEFAULT_LEGAL);
  const [modelUrl, setModelUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [busy, setBusy] = useState<Kind | null>(null);
  const [upError, setUpError] = useState("");

  async function onPick(kind: Kind, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const set = kind === "model" ? setModelUrl : setCoverUrl;
    set("");
    setUpError("");
    if (!file) return;
    setBusy(kind);
    try {
      set(await uploadDirect(file, kind));
    } catch (err) {
      setUpError(err instanceof Error ? err.message : "No se pudo subir el archivo.");
      e.target.value = "";
    } finally {
      setBusy(null);
    }
  }

  const setD = (i: number, patch: Partial<DefectRow>) => setDefects((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const setL = (i: number, patch: Partial<LegalRow>) => setLegal((rows) => rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  const item = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,150px),1fr))] items-end gap-2 rounded-xl border border-hair bg-alt p-3";
  const grid = "grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-3.5";

  return (
    <form action={action} className="flex flex-col gap-5">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <input type="hidden" name="modelUrl" value={modelUrl} />
      <input type="hidden" name="coverUrl" value={coverUrl} />
      <input type="hidden" name="defects" value={JSON.stringify(defects)} />
      <input type="hidden" name="legal" value={JSON.stringify(legal)} />

      <Panel title="Datos del auto">
        <div className={grid}>
          <Field label="Marca"><Input name="brand" defaultValue={vehicle?.brand} required maxLength={40} /></Field>
          <Field label="Modelo"><Input name="model" defaultValue={vehicle?.model} required maxLength={40} /></Field>
          <Field label="Versión"><Input name="version" defaultValue={vehicle?.version} maxLength={60} placeholder="2.0 GLS" /></Field>
          <Field label="Año"><Input type="number" name="year" defaultValue={vehicle?.year ?? new Date().getFullYear()} required min={1980} /></Field>
          <Field label="Kilometraje"><Input type="number" name="km" defaultValue={vehicle?.km ?? 0} required min={0} /></Field>
          <Field label="Precio (USD)"><Input type="number" name="priceUsd" defaultValue={vehicle?.priceUsd} required min={0} step="1" /></Field>
          <Field label="Tipo">
            <Select name="bodyType" defaultValue={vehicle?.bodyType ?? "SUV"}>{BODY_TYPES.map((t) => <option key={t}>{t}</option>)}</Select>
          </Field>
          <Field label="Color"><Input name="color" defaultValue={vehicle?.color} maxLength={40} /></Field>
          <Field label="Color de la ilustración"><Input type="color" name="hex" defaultValue={vehicle?.hex ?? "#5d6066"} /></Field>
          <Field label="Estado">
            <Select name="status" defaultValue={vehicle?.status ?? "AVAILABLE"}>
              {VEHICLE_STATUS.map((s) => <option key={s} value={s}>{VEHICLE_STATUS_LABEL[s]}</option>)}
            </Select>
          </Field>
          <Check name="published" defaultChecked={vehicle?.published ?? true} className="self-end">Visible en la tienda</Check>
          <Field label="Descripción" className="col-span-full"><Textarea name="description" defaultValue={vehicle?.description} maxLength={2000} rows={3} /></Field>
        </div>
      </Panel>

      <Panel title="Archivos">
        <div className={grid}>
          <Field label="Modelo 3D (.glb, máx. 50 MB)">
            <Input type="file" accept=".glb,model/gltf-binary" onChange={(e) => onPick("model", e)} />
            {busy === "model" && <span className="text-[13px]">Subiendo modelo…</span>}
            {modelUrl && <span className="text-[13px] text-ok">Modelo listo. Se asocia al guardar el auto.</span>}
            {vehicle?.modelUrl && (
              <span className="break-all text-[13px]">
                Actual: {vehicle.modelUrl} <Check name="removeModel" className="min-h-0 text-[13px] text-fg">Quitar</Check>
              </span>
            )}
          </Field>
          <Field label="Foto de portada (JPG, PNG o WebP, máx. 6 MB)">
            <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onPick("image", e)} />
            {busy === "image" && <span className="text-[13px]">Subiendo foto…</span>}
            {coverUrl && <span className="text-[13px] text-ok">Foto lista. Se asocia al guardar el auto.</span>}
            {vehicle?.coverUrl && <span className="break-all text-[13px]">Actual: {vehicle.coverUrl}</span>}
          </Field>
        </div>
      </Panel>

      <Panel title="Defectos detectados">
        <p className="mb-3 text-[13px] text-mut">
          La posición son tres números entre -0,5 y 0,5 respecto al centro del modelo: X (izquierda −, derecha +), Y (abajo −, arriba +) y Z (atrás −, adelante +). Pruébalos en la página del auto y ajústalos hasta que el punto caiga donde está el defecto.
        </p>
        <div className="flex flex-col gap-2.5">
          {defects.map((d, i) => (
            <div className={item} key={i}>
              <Field label="Zona"><Input value={d.zone} onChange={(e) => setD(i, { zone: e.target.value })} maxLength={80} /></Field>
              <Field label="Categoría">
                <Select value={d.category} onChange={(e) => setD(i, { category: e.target.value })}>{DEFECT_CATEGORIES.map((c) => <option key={c} value={c}>{DEFECT_CATEGORY_LABEL[c]}</option>)}</Select>
              </Field>
              <Field label="Gravedad">
                <Select value={d.severity} onChange={(e) => setD(i, { severity: e.target.value })}>{SEVERITIES.map((s) => <option key={s} value={s}>{SEVERITY_LABEL[s]}</option>)}</Select>
              </Field>
              <Field label="Detalle" className="col-span-full"><Input value={d.detail} onChange={(e) => setD(i, { detail: e.target.value })} maxLength={200} /></Field>
              {(["posX", "posY", "posZ"] as const).map((k) => (
                <Field label={k.slice(3)} key={k}><Input type="number" step="0.05" min={-1} max={1} value={d[k]} onChange={(e) => setD(i, { [k]: Number(e.target.value) })} /></Field>
              ))}
              <Button type="button" size="sm" variant="danger" onClick={() => setDefects((r) => r.filter((_, j) => j !== i))}><Trash2 aria-hidden="true" />Quitar</Button>
            </div>
          ))}
          <div><Button type="button" size="sm" variant="outline" onClick={() => setDefects((r) => [...r, { zone: "", detail: "", category: "PINTURA", severity: "LEVE", posX: 0, posY: 0, posZ: 0 }])}><Plus aria-hidden="true" />Agregar defecto</Button></div>
        </div>
      </Panel>

      <Panel title="Ficha legal">
        <div className="flex flex-col gap-2.5">
          {legal.map((l, i) => (
            <div className={item} key={i}>
              <Field label="Concepto"><Input value={l.label} onChange={(e) => setL(i, { label: e.target.value })} maxLength={60} /></Field>
              <Field label="Valor"><Input value={l.value} onChange={(e) => setL(i, { value: e.target.value })} maxLength={120} /></Field>
              <Field label="Estado">
                <Select value={l.status} onChange={(e) => setL(i, { status: e.target.value })}><option value="OK">Al día</option><option value="WARN">Con aviso</option></Select>
              </Field>
              <Button type="button" size="sm" variant="danger" onClick={() => setLegal((r) => r.filter((_, j) => j !== i))}><Trash2 aria-hidden="true" />Quitar</Button>
            </div>
          ))}
          <div><Button type="button" size="sm" variant="outline" onClick={() => setLegal((r) => [...r, { label: "", value: "", status: "OK" }])}><Plus aria-hidden="true" />Agregar concepto</Button></div>
        </div>
      </Panel>

      {upError && <ErrorNote>{upError}</ErrorNote>}
      {state?.error && <ErrorNote>{state.error}</ErrorNote>}
      <div><Submit editing={Boolean(vehicle)} busy={busy !== null} /></div>
    </form>
  );
}
