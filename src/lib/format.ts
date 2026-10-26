export const PATIO_NAME = process.env.NEXT_PUBLIC_PATIO_NAME || "ASTOREL";
/** Número internacional de Ecuador para wa.me: 593 + 9 dígitos, sin el 0 inicial (acepta 0983..., 593983... o 5930983...). */
export function normalizeEcPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("5930")) d = "593" + d.slice(4);
  else if (d.startsWith("0")) d = "593" + d.slice(1);
  return d;
}
export const WHATSAPP = normalizeEcPhone(process.env.NEXT_PUBLIC_WHATSAPP || "");

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
