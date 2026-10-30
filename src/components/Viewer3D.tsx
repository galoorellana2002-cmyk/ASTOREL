"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Minimize2, View } from "lucide-react";
import { CarArt, type ArtType } from "./CarArt";
import { Dot } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
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
    localStorage.setItem(
      key,
      String((Number(localStorage.getItem(key)) || 0) + 1),
    );
  } catch {
    /* sin almacenamiento: no pasa nada */
  }
}

export function Viewer3D({
  modelUrl,
  defects,
  art,
  hex,
  label,
}: {
  modelUrl: string | null;
  defects: ViewerDefect[];
  art: ArtType;
  hex: string;
  label: string;
}) {
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
      setPositions(
        defects.map(
          (x) =>
            `${c.x + d.x * x.posX}m ${c.y + d.y * x.posY}m ${c.z + d.z * x.posZ}m`,
        ),
      );
      setCanAr(Boolean(el.canActivateAR));
      setHint(true);
      setProgress(1);
      bump("patio_viewer_opens");
    };
    const onProgress = (e: Event) =>
      setProgress(
        (e as CustomEvent<{ totalProgress: number }>).detail.totalProgress || 0,
      );
    const onError = () => setFailed(true);
    const onCamera = (e: Event) =>
      (e as CustomEvent<{ source?: string }>).detail?.source ===
        "user-interaction" && setHint(false);
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
      if (el && positions)
        el.cameraTarget =
          i === null ? "auto auto auto" : (positions[i] ?? "auto auto auto");
    },
    [el, positions],
  );

  const current = selected !== null ? defects[selected] : null;
  const showModel = Boolean(modelUrl) && !failed;
  const tool =
    "inline-flex min-h-10 items-center gap-2 rounded-full border border-white/15 bg-[rgb(28_28_30/.72)] px-3.5 text-sm text-vfg backdrop-blur-xl transition hover:bg-white hover:text-black focus-visible:outline-white";

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div
        className={cn(
          "relative overflow-hidden border border-vline bg-vcard text-vfg",
          full
            ? "fixed inset-0 z-[80] rounded-none border-0"
            : "aspect-[4/3] rounded-3xl",
        )}
      >
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
            style={{ position: "absolute", inset: 0 }}
          >
            {positions &&
              defects.map((d, i) => (
                <button
                  key={d.id}
                  type="button"
                  slot={`hotspot-${i}`}
                  className={cn(
                    "relative block size-[22px] rounded-full border-2 border-white bg-[#ff9f0a] p-0 shadow-[0_2px_8px_rgb(0_0_0/.5)] transition-transform after:absolute after:-inset-3 after:content-['']",
                    d.severity === "MODERADO" && "bg-[#ff453a]",
                    selected === i &&
                      "scale-[1.35] outline outline-2 outline-white",
                  )}
                  data-position={positions[i]}
                  data-normal="0 1 0"
                  aria-label={`${d.zone}: ${d.detail}`}
                  onClick={() => focus(i)}
                />
              ))}
          </model-viewer>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-[radial-gradient(ellipse_80%_70%_at_50%_58%,#34353b_0%,#0b0b0d_72%)] p-6 text-center">
            <div className="w-[min(560px,90%)]">
              <CarArt type={art} hex={hex} />
            </div>
            <p className="max-w-[360px] text-sm text-[#9a9ba0]">
              {failed
                ? "No se pudo abrir el modelo 3D. Mira los detalles en la lista de abajo."
                : "El modelo 3D de este auto se está preparando. Mientras tanto, revisa sus detalles abajo."}
            </p>
          </div>
        )}

        {showModel && (
          <>
            <div
              className="absolute right-3 top-3 z-[3] flex gap-2"
              style={
                full
                  ? { top: "calc(12px + env(safe-area-inset-top, 0px))" }
                  : undefined
              }
            >
              {canAr && (
                <button
                  type="button"
                  className={tool}
                  onClick={() => void el?.activateAR()}
                >
                  <View className="size-4" aria-hidden="true" />
                  Ver en tu espacio
                </button>
              )}
              <button
                type="button"
                className={tool}
                onClick={() => setFull((f) => !f)}
              >
                {full ? (
                  <Minimize2 className="size-4" aria-hidden="true" />
                ) : (
                  <Maximize2 className="size-4" aria-hidden="true" />
                )}
                {full ? "Cerrar" : "Pantalla completa"}
              </button>
            </div>
            <AnimatePresence>
              {hint && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-4 left-1/2 z-[2] [translate:-50%_0] whitespace-nowrap rounded-full bg-[rgb(28_28_30/.72)] px-3.5 py-1.5 text-[13px] text-[#d1d1d6] backdrop-blur-xl max-sm:text-xs"
                >
                  Desliza para girar · pellizca para acercar
                </motion.div>
              )}
            </AnimatePresence>
            <div
              aria-live="polite"
              className="absolute inset-x-3 bottom-3.5 z-[3]"
            >
              <AnimatePresence mode="wait">
                {current && (
                  <motion.div
                    key={current.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-2xl border border-vline bg-[rgb(28_28_30/.86)] px-4 py-3 backdrop-blur-xl"
                  >
                    <b className="block text-[15px]">{current.zone}</b>
                    <span className="text-sm text-vmut">
                      {current.detail} ·{" "}
                      {current.severity === "MODERADO"
                        ? "Gravedad moderada"
                        : "Gravedad leve"}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 z-[4] h-[3px]"
            >
              <i
                className="block h-full bg-white transition-[width,opacity] duration-200"
                style={{
                  width: `${Math.round(progress * 100)}%`,
                  opacity: progress >= 1 ? 0 : 1,
                }}
              />
            </div>
          </>
        )}
      </div>

      {defects.length > 0 && (
        <ul
          aria-label="Defectos detectados"
          className="m-0 flex list-none flex-col gap-2 p-0"
        >
          {defects.map((d, i) => (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => focus(selected === i ? null : i)}
                className={cn(
                  "grid w-full grid-cols-[auto_1fr] items-center gap-x-2.5 gap-y-0.5 rounded-xl border bg-card px-3.5 py-2.5 text-left transition hover:border-fg/60",
                  selected === i ? "border-fg" : "border-line",
                )}
              >
                <Dot tone={d.severity === "MODERADO" ? "bad" : "warn"} />
                <span>{d.zone}</span>
                <small className="col-start-2 text-[13px] text-mut">
                  {d.detail}
                </small>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
