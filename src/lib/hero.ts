import { kmFmt } from "./format";

export interface HeroSlide {
  key: string;
  image: string;
  title: string;
  meta: string;
  href: string;
}

export function slideFrom(v: { id: string; slug: string; brand: string; model: string; year: number; km: number; coverUrl: string | null }): HeroSlide | null {
  if (!v.coverUrl) return null;
  return { key: v.id, image: v.coverUrl, title: `${v.brand} ${v.model}`, meta: `${v.year} · ${kmFmt(v.km)}`, href: `/autos/${v.slug}` };
}

