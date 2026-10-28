import Link from "next/link";
import { Hero } from "@/components/Hero";
import { CarPicker } from "@/components/CarPicker";
import { CarArt } from "@/components/CarArt";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getCatalog } from "@/lib/vehicles";
import { waLink } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

const SECTION = "py-[clamp(88px,11vw,176px)]";
const BIG = "text-[clamp(40px,5.6vw,88px)] leading-[1.02] tracking-tightest";

const FICHA = [
  ["Matrícula", "Vigente"],
  ["Gravámenes", "Ninguno"],
  ["Multas", "$0"],
  ["Revisión técnica", "Al día"],
];

const DEFECTOS = [
  ["Puerta delantera derecha", "Rayón superficial · leve"],
  ["Llanta trasera", "Desgaste parejo · leve"],
  ["Techo", "Marca de granizo · leve"],
];

const SLIP = [
  {
    when: "Desde tu casa",
    rows: [
      ["Eliges un auto del patio", "En línea"],
      ["Giras el auto en el visor 3D", "En tu teléfono"],
      ["Lees sus defectos y su ficha legal", "En su hoja"],
    ],
  },
  {
    when: "Antes de venir",
    rows: [
      ["Nos escribes por WhatsApp", "Tú eliges la hora"],
      ["Apartamos el auto para tu visita", "Por mensaje"],
    ],
  },
  {
    when: "En el patio",
    rows: [
      ["Ves el auto con su hoja en la mano", "En persona"],
      ["Confirmas cada detalle marcado", "Uno por uno"],
    ],
  },
];

export default async function HomePage() {
  const vehicles = await getCatalog({}, 12);
  const wa = waLink("Hola, quiero coordinar una visita al patio.");

  return (
    <>
      <Hero vehicles={vehicles} />

      <section id="autos" className={SECTION}>
        <div className="container">
          <Reveal>
            <CarPicker vehicles={vehicles} />
          </Reveal>
        </div>
      </section>

      <section id="confianza" className="pb-[clamp(88px,11vw,176px)]">
        <div className="container">
          <Reveal>
            <h2 className={`${BIG} mb-12`}>Sin sorpresas al llegar.</h2>
          </Reveal>
        </div>
        <div className="container">
          {/* Hojas que se apilan como carpetas con pestaña: cada una deja ver el título de la anterior. */}
          <article className="flex min-h-[70svh] md:sticky md:top-[56px] flex-col rounded-t-[20px] bg-alt md:min-h-[calc(100svh-240px)]">
            <Sheet title="Revisión de detalles" text="Pintura, llantas y tapizados se revisan con fotos de cerca. Lo que no se ve perfecto queda marcado sobre el auto, con su zona y su gravedad.">
              <div className="w-full max-w-[560px]">
                <CarArt type="suv" hex="#b4b6bc" dots={[[300, 92], [486, 150], [420, 60]]} />
                <ul className="mt-8 text-[15px]">
                  {DEFECTOS.map(([zona, nota]) => (
                    <li key={zona} className="flex justify-between gap-4 py-1.5">
                      <span>{zona}</span>
                      <span className="text-mut">{nota}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Sheet>
          </article>
          <article className="flex min-h-[70svh] flex-col rounded-t-[20px] bg-black text-white md:sticky md:top-[128px] md:min-h-[calc(100svh-240px)]">
            <Sheet title="Ficha legal clara" text="Matrícula, gravámenes, multas y revisión técnica en una sola vista, antes de pedir una visita.">
              <dl className="w-full max-w-[440px] rounded-[20px] bg-white p-7 text-black">
                <dt className="sr-only">Ejemplo</dt>
                <dd className="mb-4 text-[clamp(26px,2.4vw,34px)]">Kia Sportage 2019</dd>
                {FICHA.map(([k, val]) => (
                  <div key={k} className="flex items-center gap-3 py-2.5 text-[17px]">
                    <i aria-hidden="true" className="size-2.5 shrink-0 rounded-full bg-ok" />
                    <dt>{k}</dt>
                    <dd className="ml-auto">{val}</dd>
                  </div>
                ))}
              </dl>
            </Sheet>
          </article>
          <article id="visor" className="flex min-h-[70svh] scroll-mt-14 flex-col rounded-t-[20px] bg-[#B1B1B1] text-black md:sticky md:top-[200px] md:scroll-mt-[200px] md:min-h-[calc(100svh-240px)]">
            <Sheet title="Recorrido en 3D" text="Gira el auto, acércate y revisa cada detalle desde tu teléfono, o proyéctalo en tu calle con realidad aumentada.">
              <div className="flex w-full max-w-[560px] flex-col items-center gap-8">
                <div className="spin w-full">
                  <CarArt type="sedan" hex="#f5f5f7" />
                </div>
                <Button asChild size="lg" className="bg-black text-white hover:bg-black/80 hover:opacity-100">
                  <Link href="/autos">Probar el visor</Link>
                </Button>
              </div>
            </Sheet>
          </article>
        </div>
      </section>

      <section id="proceso" className={`${SECTION} bg-band text-band-fg`}>
        <div className="container grid gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <h2 className={BIG}>Así compras aquí.</h2>
            <p className="mt-6 max-w-[30ch] text-[17px] leading-relaxed">Llegas al patio sabiendo qué vas a encontrar, porque ya lo leíste en la hoja de cada auto.</p>
          </Reveal>
          <Reveal delay={0.1} className="md:col-span-6 md:col-start-7">
            <div className="mx-auto max-w-[480px] bg-white px-6 pb-9 pt-8 text-[17px] text-black [clip-path:polygon(0_0,100%_0,100%_calc(100%-12px),95%_100%,90%_calc(100%-12px),85%_100%,80%_calc(100%-12px),75%_100%,70%_calc(100%-12px),65%_100%,60%_calc(100%-12px),55%_100%,50%_calc(100%-12px),45%_100%,40%_calc(100%-12px),35%_100%,30%_calc(100%-12px),25%_100%,20%_calc(100%-12px),15%_100%,10%_calc(100%-12px),5%_100%,0_calc(100%-12px))] md:mx-0 md:ml-auto">
              {SLIP.map((g, gi) => (
                <div key={g.when} className={gi ? "mt-7" : ""}>
                  <h3 className="text-[17px] text-black/60">{g.when}</h3>
                  <ul className="mt-2">
                    {g.rows.map(([what, where]) => (
                      <li key={what} className="flex items-end gap-2 py-1.5">
                        <span>{what}</span>
                        <span aria-hidden="true" className="mb-1.5 min-w-6 flex-1 border-b-4 border-dotted border-black/30" />
                        <span className="shrink-0">{where}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="-mx-6 mt-8 flex min-h-11 items-center justify-between gap-3 bg-black px-6 py-2.5 text-white">
                <span>Llegas sabiendo qué vas a ver</span>
                <span>Sin sorpresas</span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="contacto" className="flex flex-col justify-between gap-16 bg-vbg px-4 py-16 md:min-h-[min(100svh,900px)] md:py-10 text-center text-vfg">
        <h2 className="sr-only">¿Lo miras aquí o lo visitas?</h2>
        <Reveal>
          <p aria-hidden="true" className="text-[clamp(44px,8.6vw,136px)] leading-none tracking-tightest">¿Lo miras aquí</p>
        </Reveal>
        <Reveal delay={0.1} className="mx-auto flex w-full max-w-[640px] flex-col items-center gap-4">
          <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-6">
            <Button asChild variant="light" size="lg" className="w-[72%] sm:w-auto sm:min-w-[220px]">
              <Link href="/autos">Ver los autos</Link>
            </Button>
            <span className="text-[17px] text-vmut">o</span>
            <Button asChild size="lg" className="w-[72%] bg-vfg/[.12] text-vfg hover:bg-vfg/20 hover:opacity-100 sm:w-auto sm:min-w-[220px]">
              <a href={wa} target="_blank" rel="noopener noreferrer">Coordinar una visita</a>
            </Button>
          </div>
          <p className="text-[15px] text-vmut">La visita se coordina por WhatsApp, con el auto que elegiste.</p>
        </Reveal>
        <Reveal delay={0.15}>
          <p aria-hidden="true" className="text-[clamp(44px,8.6vw,136px)] leading-none tracking-tightest">o lo visitas?</p>
        </Reveal>
      </section>
    </>
  );
}

function Sheet({ title, text, children }: { title: string; text: string; children: React.ReactNode }) {
  return (
    <div className="grid flex-1 grid-rows-[auto_1fr] md:grid-cols-12">
      <h3 className="flex h-[52px] items-center px-5 text-[22px] tracking-tight md:col-span-12 md:h-[72px] md:px-8 md:text-[clamp(28px,2.4vw,34px)]">{title}</h3>
      <div className="order-3 flex items-end px-5 pb-8 md:order-none md:col-span-5 md:px-8 md:pb-10">
        <p className="max-w-[40ch] text-[17px] leading-relaxed ">{text}</p>
      </div>
      <Reveal y={40} className="flex items-center justify-center px-5 py-8 md:col-span-7 md:py-10 md:pr-8">{children}</Reveal>
    </div>
  );
}
