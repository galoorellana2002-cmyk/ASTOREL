export const PATIO_NAME = process.env.NEXT_PUBLIC_PATIO_NAME || "ASTOREL";
export const WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP || "").replace(/\D/g, "");

export function money(cents: number): string {
  return "$" + Math.round(cents / 100).toLocaleString("es-EC");
}

export function kmFmt(km: number): string {
  return km.toLocaleString("es-EC") + " km";
}

export function waLink(text: string): string {
  const base = WHATSAPP ? `https://wa.me/${WHATSAPP}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function dateTime(d: Date): string {
  return d.toLocaleString("es-EC", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Guayaquil" });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
