import Link from "next/link";
import { Hero } from "@/components/Hero";
import { CatalogSlider } from "@/components/CatalogSlider";
import { getCatalog } from "@/lib/vehicles";
import { waLink } from "@/lib/format";

export const dynamic = "force-dynamic";

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default async function HomePage() {
  const vehicles = await getCatalog({}, 12);
  const wa = waLink("Hola, quiero información sobre los autos del patio.");

  return (
    <>
      <Hero />

      <section className="alt" id="autos">
        <div className="wrap">
          <h2 className="sec-title rv">Conoce los autos del patio</h2>
          <p className="sec-sub rv" style={{ ["--d" as string]: "80ms" }}>
            Toca un auto para ver sus detalles, su estado legal y su recorrido en 3D.
          </p>
          <CatalogSlider vehicles={vehicles} />
          <div className="center">
            <Link className="btn out" href="/autos">
              Ver todos los autos
            </Link>
          </div>
        </div>
      </section>

      <div className="band" id="contacto">
        <div className="wrap">
          <div className="actions-bar">
            <Link href="/autos">
              <Icon d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3z" />
              Ver autos disponibles
            </Link>
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <Icon d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7" />
              Solicitar información
            </a>
            <a href={wa} target="_blank" rel="noopener noreferrer">
              <Icon d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z" />
              Contáctanos
            </a>
          </div>
        </div>
      </div>

      <section id="visor" style={{ background: "var(--viewer-bg)", color: "var(--viewer-fg)" }}>
        <div className="wrap">
          <div className="head rv">
            <span className="eyebrow">Visor 3D</span>
            <h2 className="sec-title">Gíralo. Acércate. Revisa cada detalle.</h2>
            <p className="sec-sub">Cada defecto aparece marcado sobre el auto, con su zona y su gravedad. Abre cualquier auto para probarlo.</p>
          </div>
          <div className="center" style={{ marginTop: 0 }}>
            <Link className="btn" style={{ background: "#fff", color: "#010205", borderColor: "#fff" }} href="/autos">
              Probar el visor
            </Link>
          </div>
        </div>
      </section>

      <section id="confianza">
        <div className="wrap">
          <h2 className="sec-title rv">Sin sorpresas al llegar</h2>
          <div className="trio" style={{ marginTop: 44 }}>
            <div className="rv">
              <div className="ico"><Icon d="M20 20l-4-4M18 11a7 7 0 11-14 0 7 7 0 0114 0z" /></div>
              <h3>Revisión de detalles</h3>
              <p>Pintura, llantas y tapizados se revisan con fotos de cerca. Lo que no se ve perfecto queda marcado y explicado.</p>
            </div>
            <div className="rv" style={{ ["--d" as string]: "110ms" }}>
              <div className="ico"><Icon d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3zM8.5 12l2.5 2.5L15.5 10" /></div>
              <h3>Ficha legal clara</h3>
              <p>Matrícula, gravámenes, multas y revisión técnica en una sola vista, antes de pedir una visita.</p>
            </div>
            <div className="rv" style={{ ["--d" as string]: "220ms" }}>
              <div className="ico"><Icon d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM12 12l8-4.5M12 12L4 7.5M12 12v9" /></div>
              <h3>Recorrido en 3D</h3>
              <p>Mira el auto por fuera y por dentro desde tu teléfono, o proyéctalo en tu calle con realidad aumentada.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
