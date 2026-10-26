import { ImageResponse } from "next/og";

export const alt = "ASTOREL · Autos usados con modelo 3D";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "radial-gradient(ellipse at 50% 30%, #2a2b30 0%, #000 70%)", color: "#fff" }}>
        <div style={{ fontSize: 56, letterSpacing: 18, opacity: 0.9 }}>ASTOREL</div>
        <div style={{ fontSize: 84, marginTop: 40, lineHeight: 1.05 }}>Cada detalle, a la vista.</div>
        <div style={{ fontSize: 34, marginTop: 28, color: "#b1b1b1" }}>Autos usados con modelo 3D, defectos marcados y ficha legal al día.</div>
      </div>
    ),
    size,
  );
}
