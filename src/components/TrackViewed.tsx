"use client";

import { useEffect } from "react";

/** Guarda en el navegador qué autos vio el cliente; el chat lo envía para clasificarlo mejor. */
export function TrackViewed({ slug }: { slug: string }) {
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("patio_viewed") || "[]") as unknown;
      const list = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
      if (!list.includes(slug)) localStorage.setItem("patio_viewed", JSON.stringify([...list, slug].slice(-100)));
    } catch {
      /* sin almacenamiento */
    }
  }, [slug]);
  return null;
}
