"use client";

import { useCallback, useEffect, useState } from "react";
import { CarArt, type ArtType } from "./CarArt";
import type { ModelViewerElement } from "@/types/model-viewer";

export interface ViewerDefect {
  id: string;
  zone: string;
  detail: string;
  severity: string;
  posX: number;
  posY: number;
  posZ: number;
}

function bump(key: string) {
  try {
    localStorage.setItem(key, String((Number(localStorage.getItem(key)) || 0) + 1));
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export function Viewer3D({ modelUrl, defects, art, hex, label }: { modelUrl: string | null; defects: ViewerDefect[]; art: ArtType; hex: string; label: string }) {
  const [el, setEl] = useState<ModelViewerElement | null>(null);
  const [positions, setPositions] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [full, setFull] = useState(false);
  const [canAr, setCanAr] = useState(false);
  const [progress, setProgress] = useState(0);
  const [hint, setHint] = useState(false);
  const [failed, setFailed] = useState(false);

  // La librería (three.js) pesa: solo se descarga cuando el auto tiene modelo.
  useEffect(() => {
    if (modelUrl) void import("@google/model-viewer");
  }, [modelUrl]);

  useEffect(() => {
    if (!el) return;
    const onLoad = () => {
      const d = el.getDimensions();
      const c = el.getBoundingBoxCenter();
      setPositions(defects.map((x) => `${c.x + d.x * x.posX}m ${c.y + d.y * x.posY}m ${c.z + d.z * x.posZ}m`));
      setCanAr(Boolean(el.canActivateAR));
      setHint(true);
      setProgress(1);
      bump("patio_viewer_opens");
    };
    const onProgress = (e: Event) => setProgress((e as CustomEvent<{ totalProgress: number }>).detail.totalProgress || 0);
    const onError = () => setFailed(true);
    const onCamera = (e: Event) => (e as CustomEvent<{ source?: string }>).detail?.source === "user-interaction" && setHint(false);
    el.addEventListener("load", onLoad);
    el.addEventListener("progress", onProgress);
    el.addEventListener("error", onError);
    el.addEventListener("camera-change", onCamera);
    return () => {
      el.removeEventListener("load", onLoad);
      el.removeEventListener("progress", onProgress);
      el.removeEventListener("error", onError);
      el.removeEventListener("camera-change", onCamera);
    };
  }, [el, defects]);

  useEffect(() => {
    document.body.classList.toggle("nofs", full);
    if (!full) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setFull(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [full]);

  const focus = useCallback(
    (i: number | null) => {
      setSelected(i);
      setHint(false);
      if (el && positions) el.cameraTarget = i === null ? "auto auto auto" : (positions[i] ?? "auto auto auto");
    },
    [el, positions],
  );

  const current = selected !== null ? defects[selected] : null;
  const showModel = Boolean(modelUrl) && !failed;

  return (
    <div className="v-main">
      <div className={`stage pdv${full ? " full" : ""}`}>
        {showModel ? (
          <model-viewer
            ref={setEl}
            src={modelUrl ?? undefined}
            alt={`Modelo 3D de ${label}`}
            camera-controls=""
            touch-action="pan-y"
            ar=""
            ar-modes="webxr scene-viewer quick-look"
            shadow-intensity="1"
            exposure="1.05"
            interaction-prompt="none"
          >
            {positions &&
              defects.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  slot={`hotspot-${i}`}
                  className={`hs ${d.severity === "MODERADO" ? "moderado" : ""}${selected === i ? " on" : ""}`}
                  data-position={positions[i]}
                  data-normal="0 1 0"
                  aria-label={`${d.zone}: ${d.detail}`}
                  onClick={() => focus(i)}
                />
              ))}
          </model-viewer>
        ) : (
          <div className="fallback">
            <div className="art">
              <CarArt type={art} hex={hex} />
            </div>
            <p>{failed ? "No se pudo abrir el modelo 3D. Mira los detalles en la lista de abajo." : "El modelo 3D de este auto se está preparando. Mientras tanto, revisa sus detalles abajo."}</p>
          </div>
        )}

        {showModel && (
          <>
            <div className="tools">
              {canAr && (
                <button type="button" className="tool" onClick={() => void el?.activateAR()}>
                  Ver en tu espacio
                </button>
              )}
              <button type="button" className="tool" onClick={() => setFull((f) => !f)}>
                {full ? "Cerrar" : "Pantalla completa"}
              </button>
            </div>
            {hint && <div className="hint">Desliza para girar · pellizca para acercar</div>}
            <div className={`cap${current ? " show" : ""}`} aria-live="polite">
              {current && (
                <>
                  <b>{current.zone}</b>
                  <span>
                    {current.detail} · {current.severity === "MODERADO" ? "Gravedad moderada" : "Gravedad leve"}
                  </span>
                </>
              )}
            </div>
            <div className="bar" aria-hidden="true">
              <i style={{ width: `${Math.round(progress * 100)}%`, opacity: progress >= 1 ? 0 : 1 }} />
            </div>
          </>
        )}
      </div>

      {defects.length > 0 && (
        <ul className="defect-list" aria-label="Defectos detectados">
          {defects.map((d, i) => (
            <li key={d.id}>
              <button type="button" className={selected === i ? "on" : ""} onClick={() => focus(selected === i ? null : i)} disabled={!showModel && false}>
                <i className={`dot ${d.severity === "MODERADO" ? "bad" : "warn"}`} />
                <b style={{ fontWeight: 500 }}>{d.zone}</b>
                <small>{d.detail}</small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
