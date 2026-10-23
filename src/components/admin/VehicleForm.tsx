"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { saveVehicle, type FormState } from "@/app/admin/actions";
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
    <button className="btn" type="submit" disabled={pending || busy}>
      {busy ? "Subiendo archivo…" : pending ? "Guardando…" : editing ? "Guardar cambios" : "Crear auto"}
    </button>
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

  return (
    <form action={action} className="repeat" style={{ gap: 18 }}>
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <input type="hidden" name="modelUrl" value={modelUrl} />
      <input type="hidden" name="coverUrl" value={coverUrl} />
      <input type="hidden" name="defects" value={JSON.stringify(defects)} />
      <input type="hidden" name="legal" value={JSON.stringify(legal)} />

      <section className="panel">
        <h2>Datos del auto</h2>
        <div className="form-grid">
          <label className="lbl">Marca<input className="field" name="brand" defaultValue={vehicle?.brand} required maxLength={40} /></label>
          <label className="lbl">Modelo<input className="field" name="model" defaultValue={vehicle?.model} required maxLength={40} /></label>
          <label className="lbl">Versión<input className="field" name="version" defaultValue={vehicle?.version} maxLength={60} placeholder="2.0 GLS" /></label>
          <label className="lbl">Año<input className="field" type="number" name="year" defaultValue={vehicle?.year ?? new Date().getFullYear()} required min={1980} /></label>
          <label className="lbl">Kilometraje<input className="field" type="number" name="km" defaultValue={vehicle?.km ?? 0} required min={0} /></label>
          <label className="lbl">Precio (USD)<input className="field" type="number" name="priceUsd" defaultValue={vehicle?.priceUsd} required min={0} step="1" /></label>
          <label className="lbl">Tipo
            <select className="field" name="bodyType" defaultValue={vehicle?.bodyType ?? "SUV"}>{BODY_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          </label>
          <label className="lbl">Color<input className="field" name="color" defaultValue={vehicle?.color} maxLength={40} /></label>
          <label className="lbl">Color de la ilustración
            <input className="field" type="color" name="hex" defaultValue={vehicle?.hex ?? "#5d6066"} style={{ padding: 4 }} />
          </label>
          <label className="lbl">Estado
            <select className="field" name="status" defaultValue={vehicle?.status ?? "AVAILABLE"}>
              {VEHICLE_STATUS.map((s) => <option key={s} value={s}>{VEHICLE_STATUS_LABEL[s]}</option>)}
            </select>
          </label>
          <label className="check"><input type="checkbox" name="published" defaultChecked={vehicle?.published ?? true} /> Visible en la tienda</label>
          <label className="lbl wide">Descripción<textarea className="field" name="description" defaultValue={vehicle?.description} maxLength={2000} rows={3} /></label>
        </div>
      </section>

      <section className="panel">
        <h2>Archivos</h2>
        <div className="form-grid">
          <label className="lbl">
            Modelo 3D (.glb, máx. 50 MB)
            <input className="field" type="file" accept=".glb,model/gltf-binary" onChange={(e) => onPick("model", e)} />
            {busy === "model" && <span className="small">Subiendo modelo…</span>}
            {modelUrl && <span className="small">Modelo listo. Se asocia al guardar el auto.</span>}
            {vehicle?.modelUrl && (
              <span className="small">
                Actual: {vehicle.modelUrl} <label className="check" style={{ minHeight: 0 }}><input type="checkbox" name="removeModel" /> Quitar</label>
              </span>
            )}
          </label>
          <label className="lbl">
            Foto de portada (JPG, PNG o WebP, máx. 6 MB)
            <input className="field" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => onPick("image", e)} />
            {busy === "image" && <span className="small">Subiendo foto…</span>}
            {coverUrl && <span className="small">Foto lista. Se asocia al guardar el auto.</span>}
            {vehicle?.coverUrl && <span className="small">Actual: {vehicle.coverUrl}</span>}
          </label>
        </div>
      </section>

      <section className="panel">
        <h2>Defectos detectados</h2>
        <p className="small" style={{ marginBottom: 10 }}>
          La posición son tres números entre -0,5 y 0,5 respecto al centro del modelo: X (izquierda −, derecha +), Y (abajo −, arriba +) y Z (atrás −, adelante +). Pruébalos en la página del auto y ajústalos hasta que el punto caiga donde está el defecto.
        </p>
        <div className="repeat">
          {defects.map((d, i) => (
            <div className="item" key={i}>
              <label className="lbl">Zona<input className="field" value={d.zone} onChange={(e) => setD(i, { zone: e.target.value })} maxLength={80} /></label>
              <label className="lbl">Categoría
                <select className="field" value={d.category} onChange={(e) => setD(i, { category: e.target.value })}>{DEFECT_CATEGORIES.map((c) => <option key={c} value={c}>{DEFECT_CATEGORY_LABEL[c]}</option>)}</select>
              </label>
              <label className="lbl">Gravedad
                <select className="field" value={d.severity} onChange={(e) => setD(i, { severity: e.target.value })}>{SEVERITIES.map((s) => <option key={s} value={s}>{SEVERITY_LABEL[s]}</option>)}</select>
              </label>
              <label className="lbl wide">Detalle<input className="field" value={d.detail} onChange={(e) => setD(i, { detail: e.target.value })} maxLength={200} /></label>
              {(["posX", "posY", "posZ"] as const).map((k) => (
                <label className="lbl" key={k}>{k.slice(3)}<input className="field" type="number" step="0.05" min={-1} max={1} value={d[k]} onChange={(e) => setD(i, { [k]: Number(e.target.value) })} /></label>
              ))}
              <button type="button" className="btn sm danger" onClick={() => setDefects((r) => r.filter((_, j) => j !== i))}>Quitar</button>
            </div>
          ))}
          <div><button type="button" className="btn sm out" onClick={() => setDefects((r) => [...r, { zone: "", detail: "", category: "PINTURA", severity: "LEVE", posX: 0, posY: 0, posZ: 0 }])}>Agregar defecto</button></div>
        </div>
      </section>

      <section className="panel">
        <h2>Ficha legal</h2>
        <div className="repeat">
          {legal.map((l, i) => (
            <div className="item" key={i}>
              <label className="lbl">Concepto<input className="field" value={l.label} onChange={(e) => setL(i, { label: e.target.value })} maxLength={60} /></label>
              <label className="lbl">Valor<input className="field" value={l.value} onChange={(e) => setL(i, { value: e.target.value })} maxLength={120} /></label>
              <label className="lbl">Estado
                <select className="field" value={l.status} onChange={(e) => setL(i, { status: e.target.value })}><option value="OK">Al día</option><option value="WARN">Con aviso</option></select>
              </label>
              <button type="button" className="btn sm danger" onClick={() => setLegal((r) => r.filter((_, j) => j !== i))}>Quitar</button>
            </div>
          ))}
          <div><button type="button" className="btn sm out" onClick={() => setLegal((r) => [...r, { label: "", value: "", status: "OK" }])}>Agregar concepto</button></div>
        </div>
      </section>

      {upError && <p className="msg-err" role="alert">{upError}</p>}
      {state?.error && <p className="msg-err" role="alert">{state.error}</p>}
      <div><Submit editing={Boolean(vehicle)} busy={busy !== null} /></div>
    </form>
  );
}
