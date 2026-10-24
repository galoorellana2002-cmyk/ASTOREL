import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PATIO_NAME } from "@/lib/format";
import { MotionProvider } from "@/components/ui/reveal";

export const metadata: Metadata = {
  title: { default: PATIO_NAME, template: `%s · ${PATIO_NAME}` },
  description: "Autos usados con modelo 3D, defectos marcados y ficha legal al día.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Questrial&display=swap" />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
