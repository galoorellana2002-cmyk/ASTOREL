import Link from "next/link";
import { CarFront, FileText, Phone } from "lucide-react";
import { Hero } from "@/components/Hero";
import { CatalogSlider } from "@/components/CatalogSlider";
import { CarArt } from "@/components/CarArt";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getCatalog } from "@/lib/vehicles";
import { waLink } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

const SECTION = "py-[clamp(72px,10vw,144px)]";
const TITLE = "text-balance text-center text-[clamp(34px,5vw,64px)] leading-[1.04] tracking-tightest";
const SUB = "mx-auto mt-5 max-w-[560px] text-center text-[19px] text-fg/75";

const TRUST = [
  { title: "Revisión de detalles", text: "Pintura, llantas y tapizados se revisan con fotos de cerca. Lo que no se ve perfecto queda marcado y explicado." },
  { title: "Ficha legal clara", text: "Matrícula, gravámenes, multas y revisión técnica en una sola vista, antes de pedir una visita." },
  { title: "Recorrido en 3D", text: "Mira el auto por fuera y por dentro desde tu teléfono, o proyéctalo en tu calle con realidad aumentada." },
];

export default async function HomePage() {
  const vehicles = await getCatalog({}, 12);
  const wa = waLink("Hola, quiero información sobre los autos del patio.");
  const actions = [
    { href: "/autos", icon: CarFront, label: "Ver autos disponibles", external: false },
    { href: wa, icon: FileText, label: "Solicitar información", external: true },
    { href: wa, icon: Phone, label: "Contáctanos", external: true },
  ];

  return (
    <>
      <Hero />

      <section className={`${SECTION} bg-alt`} id="autos">
        <div className="container">
          <Reveal>
            <h2 className={TITLE}>Conoce los autos del patio</h2>
          </Reveal>
          <Reveal delay={0.08}>
            <p className={SUB}>Toca un auto para ver sus detalles, su estado legal y su recorrido en 3D.</p>
          </Reveal>
          <CatalogSlider vehicles={vehicles} />
          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline">
              <Link href="/autos">Ver todos los autos</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="bg-band text-band-fg" id="contacto">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            {actions.map((a) => {
              const Icon = a.icon;
              const cls = "flex min-h-16 items-center justify-center gap-3 border-t border-band-line px-3 py-5 text-sm transition first:border-t-0 hover:bg-white/5 focus-visible:outline-white sm:border-l sm:border-t-0 sm:first:border-l-0";
              return a.external ? (
                <a key={a.label} href={a.href} target="_blank" rel="noopener noreferrer" className={cls}>
                  <Icon className="size-6 shrink-0" strokeWidth={1.4} aria-hidden="true" />
                  {a.label}
                </a>
              ) : (
                <Link key={a.label} href={a.href} className={cls}>
                  <Icon className="size-6 shrink-0" strokeWidth={1.4} aria-hidden="true" />
                  {a.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <section id="visor" className={`${SECTION} overflow-hidden bg-vbg text-vfg`}>
        <div className="container">
          <Reveal className="text-center">
            <h2 className={TITLE}>Gíralo. Acércate. Revisa cada detalle.</h2>
            <p className={`${SUB} text-vfg/80`}>Cada defecto aparece marcado sobre el auto, con su zona y su gravedad. Abre cualquier auto para probarlo.</p>
          </Reveal>

          <Reveal delay={0.1} y={40} className="mx-auto mt-12 max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_80%_70%_at_50%_58%,#34353b_0%,#0b0b0d_72%)] px-[6%] pb-10 pt-14">
              <CarArt type="suv" hex="#b4b6bc" dots={[[300, 92], [486, 150], [420, 60]]} />
              <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-vcard px-4 py-3 text-[15px]">
                <span><span className="mr-2 text-vmut">Ejemplo ·</span>Puerta delantera derecha</span>
                <span className="text-vfg/80">Rayón superficial · Gravedad leve</span>
              </div>
            </div>
          </Reveal>

          <div className="mt-10 flex justify-center">
            <Button asChild variant="light" size="lg">
              <Link href="/autos">Probar el visor</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="confianza" className={SECTION}>
        <div className="container">
          <Reveal>
            <h2 className={TITLE}>Sin sorpresas al llegar</h2>
          </Reveal>
          <div className="mt-14 grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-x-9 gap-y-12">
            {TRUST.map((t, i) => (
              <Reveal key={t.title} delay={i * 0.11}>
                <h3 className="mb-3 text-[clamp(24px,2.2vw,30px)] leading-tight tracking-tight">{t.title}</h3>
                <p className="text-[17px] leading-relaxed text-fg">{t.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
