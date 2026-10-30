import Link from "next/link";
import { ArrowUpRight, Search, KeyRound, Maximize2, Move, Minus, Plus, Rotate3d, ScanSearch, ShieldCheck, Armchair, Scan, Box } from "lucide-react";
import { HomeHero } from "@/components/HomeHero";
import { slideFrom, type HeroSlide } from "@/lib/hero";
import { VehicleCard } from "@/components/VehicleCard";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/ui/reveal";
import { getCatalog } from "@/lib/vehicles";
import { BODY_TYPES } from "@/lib/constants";
import { WHATSAPP, waLink } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

const SECTION = "py-[clamp(48px,6vw,72px)]";
const EYEBROW = "block text-[11px] uppercase tracking-[.16em] text-mut";
const H2 = "text-balance text-[clamp(30px,4.2vw,46px)] leading-[1.08] tracking-[-0.045em]";

const BENEFITS = [
  { icon: ScanSearch, title: "Revisión de detalles", text: "Pintura, llantas y tapizados se revisan con fotos de cerca. Lo que no se ve perfecto queda marcado y explicado." },
  { icon: ShieldCheck, title: "Ficha legal clara", text: "Matrícula, gravámenes, multas y revisión técnica en una sola vista, antes de pedir una visita." },
  { icon: Rotate3d, title: "Recorrido en 3D", text: "Mira el auto por fuera y por dentro desde tu teléfono, o proyéctalo en tu calle con realidad aumentada." },
  { icon: KeyRound, title: "Sin vueltas", text: "Reserva o coordina una visita por WhatsApp. Tú eliges cuándo y cómo avanzar." },
];

const PRICES = [10000, 15000, 20000, 30000, 50000];
const sel = "h-14 w-full cursor-pointer appearance-none border border-hair bg-transparent px-[18px] text-xs text-fg focus-visible:outline-fg";

export default async function HomePage() {
  const all = await getCatalog({});
  const shown = all.slice(0, 3);
  const slides = all.map(slideFrom).filter((s): s is HeroSlide => s !== null).slice(0, 3);
  const phone = WHATSAPP ? `+${WHATSAPP.replace(/^(\d{3})(\d{2})(\d{3})(\d{4})$/, "$1 $2 $3 $4")}` : null;
  const wa = waLink("Hola, quiero información sobre los autos del patio.");

  return (
    <>
      <HomeHero slides={slides} />

      <section id="autos" className={`container scroll-mt-24 ${SECTION}`}>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-4">
            <span className={EYEBROW}>01 / Encuentra el tuyo</span>
            <h2 className={H2}>Una selección que se distingue.</h2>
          </div>
          <p className="text-xs text-mut">{all.length === 1 ? "1 vehículo disponible" : `${all.length} vehículos disponibles`}</p>
        </Reveal>

        <form method="get" action="/autos" className="mt-8 grid gap-3 md:grid-cols-[minmax(0,1.4fr)_1fr_1fr_auto]">
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute left-[18px] top-1/2 size-[18px] -translate-y-1/2 text-mut" strokeWidth={1.4} />
            <input type="search" name="q" aria-label="Buscar por marca, modelo o color" placeholder="Busca por marca, modelo o color" maxLength={40} className="h-14 w-full border border-line bg-transparent pl-12 pr-4 text-[13px] placeholder:text-mut focus-visible:outline-fg" />
          </div>
          <select name="tipo" aria-label="Tipo de vehículo" defaultValue="" className={sel}>
            <option value="">Tipo de vehículo</option>
            {BODY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select name="max" aria-label="Rango de precio" defaultValue="" className={sel}>
            <option value="">Rango de precio</option>
            {PRICES.map((p) => (
              <option key={p} value={p}>Hasta ${p.toLocaleString("es-EC")}</option>
            ))}
          </select>
          <button type="submit" className="inline-flex h-14 items-center justify-center gap-3 bg-inv px-8 text-[13px] text-inv-fg transition hover:opacity-85 focus-visible:outline-fg">
            Buscar
            <ArrowUpRight className="size-4" strokeWidth={1.4} aria-hidden="true" />
          </button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <ul className="flex flex-wrap gap-2">
            <li><Link href="/autos" className="inline-flex min-h-11 items-center bg-inv px-[18px] text-[11px] text-inv-fg">Todos</Link></li>
            {BODY_TYPES.filter((t) => t !== "Otro").map((t) => (
              <li key={t}>
                <Link href={`/autos?tipo=${encodeURIComponent(t)}`} className="inline-flex min-h-11 items-center bg-alt px-[18px] text-[11px] text-mut transition hover:text-fg focus-visible:outline-fg">{t}</Link>
              </li>
            ))}
          </ul>
          <Link href="/autos?orden=precio-asc" className="inline-flex min-h-11 items-center text-[11px] text-mut underline-offset-4 hover:text-fg hover:underline focus-visible:outline-fg">Ordenar por precio</Link>
        </div>

        {shown.length ? (
          <div className="mt-8 grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-6">
            {shown.map((v, i) => (
              <Reveal key={v.id} delay={i * 0.08} className="flex">
                <VehicleCard v={v} className="w-full" />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-8 border border-hair px-6 py-16 text-center text-mut">
            Estamos preparando los primeros autos del patio.{" "}
            <a href={wa} target="_blank" rel="noopener noreferrer" className="text-fg underline underline-offset-4">Escríbenos y te contamos qué hay.</a>
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link href="/autos" className="inline-flex h-[50px] items-center gap-6 border border-line px-[22px] text-[13px] transition hover:bg-fg hover:text-bg focus-visible:outline-fg">
            {all.length > 3 ? `Ver los ${all.length} vehículos` : "Ver todos los autos"}
            <ArrowUpRight className="size-[17px]" strokeWidth={1.4} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="visor" className="scroll-mt-14 overflow-hidden bg-vbg py-[clamp(40px,6vw,64px)] text-vfg">
        <div className="container flex flex-col gap-9">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="flex flex-col gap-[18px]">
              <span className="block text-[11px] uppercase tracking-[.16em] text-vmut">02 / Tu showroom, donde estés</span>
              <h2 className="text-balance text-[clamp(32px,4.4vw,48px)] leading-[1.08] tracking-[-0.045em]">No lo imagines. Explóralo.</h2>
            </div>
            <p className="max-w-[350px] text-sm leading-[1.65] text-vmut">Acércate, gira y descubre cada ángulo. Los defectos aparecen marcados sobre el auto, con su zona y su gravedad.</p>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_332px]">
            <Reveal y={30} className="relative min-h-[300px] overflow-hidden bg-vcard sm:aspect-[956/470] lg:aspect-auto lg:h-[470px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/design/visor.png" alt="Ejemplo de visor 3D con un auto gris" loading="lazy" className="absolute inset-0 size-full object-cover" />
              <span className="absolute left-5 top-5 inline-flex items-center gap-2 text-[11px] tracking-[.1em]"><Box className="size-4" strokeWidth={1.4} aria-hidden="true" />VISTA 360° · EJEMPLO</span>
              <span aria-hidden="true" className="absolute right-5 top-5 grid size-[34px] place-items-center bg-vcard/80"><Maximize2 className="size-[18px]" strokeWidth={1.4} /></span>
              <span aria-hidden="true" className="absolute left-[36%] top-[56%] grid size-[30px] place-items-center rounded-full border border-white/70 bg-black/50"><Plus className="size-3.5" /></span>
              <span aria-hidden="true" className="absolute left-[68%] top-[50%] grid size-[30px] place-items-center rounded-full border border-white/70 bg-black/50"><Plus className="size-3.5" /></span>
              <div className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-3 text-[13px]">
                <span className="flex">
                  <span className="bg-white px-5 py-3 text-black">Exterior</span>
                  <span className="bg-vcard/90 px-5 py-3">Interior</span>
                </span>
                <span className="hidden items-center gap-2 text-[10px] text-vmut sm:inline-flex"><Move className="size-4" strokeWidth={1.4} aria-hidden="true" />Arrastra para girar</span>
                <span aria-hidden="true" className="flex gap-[18px] bg-vcard/90 p-2.5"><Minus className="size-4" /><Plus className="size-4" /></span>
              </div>
            </Reveal>

            <Reveal y={30} delay={0.1} className="flex flex-col gap-6 bg-vcard p-7">
              <span className="text-[11px] tracking-[.16em] text-vmut">SELECCIÓN ASTOREL</span>
              <div>
                <p className="text-[30px] leading-[1.15] tracking-[-0.03em]">Cada auto,<br />en 3D</p>
                <p className="mt-2.5 text-xs text-vmut">Abre cualquiera del inventario para probarlo.</p>
              </div>
              <dl className="flex flex-col gap-[15px] text-[11px]">
                {[["Defectos", "Marcados en el modelo"], ["Ficha legal", "En una sola vista"], ["Vistas", "Exterior e interior"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <dt className="text-vmut">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <Link href="/autos" className="mt-auto inline-flex h-[50px] w-fit items-center gap-6 bg-white px-[22px] text-[13px] text-black transition hover:bg-white/85 focus-visible:outline-white">
                Probar el visor
                <ArrowUpRight className="size-[17px]" strokeWidth={1.4} aria-hidden="true" />
              </Link>
            </Reveal>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-9 gap-y-3 text-[11px] text-vmut">
            <span className="flex flex-wrap gap-x-9 gap-y-3">
              <span className="inline-flex items-center gap-2.5"><Rotate3d className="size-[17px]" strokeWidth={1.4} aria-hidden="true" />Recorrido exterior 360°</span>
              <span className="inline-flex items-center gap-2.5"><Armchair className="size-[17px]" strokeWidth={1.4} aria-hidden="true" />Interior en detalle</span>
              <span className="inline-flex items-center gap-2.5"><Scan className="size-[17px]" strokeWidth={1.4} aria-hidden="true" />Puntos de interés</span>
            </span>
            <span className="text-[10px]">La imagen es un ejemplo del visor.</span>
          </div>
        </div>
      </section>

      <section id="beneficios" className={`container scroll-mt-14 ${SECTION}`}>
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-[18px]">
            <span className={EYEBROW}>03 / Más certezas, menos dudas</span>
            <h2 className={H2}>Comprar bien se siente distinto.</h2>
          </div>
          <p className="max-w-[280px] text-[13px] leading-[1.6] text-mut">Una experiencia transparente. Antes, durante y después de elegir.</p>
        </Reveal>
        <div className="mt-11 grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-8">
          {BENEFITS.map((b, i) => {
            const Icon = b.icon;
            return (
              <Reveal key={b.title} delay={i * 0.08} className="flex flex-col gap-5 border-t border-line pt-[22px]">
                <div className="flex items-center justify-between">
                  <Icon className="size-[26px]" strokeWidth={1.2} aria-hidden="true" />
                  <span className="text-[10px] text-mut">0{i + 1}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <h3 className="text-xl leading-tight tracking-[-0.02em]">{b.title}</h3>
                  <p className="text-[13px] leading-[1.7] text-mut">{b.text}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="confianza" className="scroll-mt-14 bg-alt py-[clamp(40px,6vw,64px)]">
        <div className="container flex flex-col gap-12 lg:flex-row lg:gap-[90px]">
          <Reveal className="flex flex-col gap-[22px] lg:w-[470px] lg:shrink-0">
            <span className={EYEBROW}>La confianza también se conduce</span>
            <h2 className="text-[clamp(32px,3.8vw,42px)] leading-[1.1] tracking-[-0.045em]">Buenas decisiones.<br />Historias reales.</h2>
            <div className="flex gap-[54px] pt-3">
              <div className="flex flex-col gap-[7px]">
                <span className="text-[35px] tracking-[-0.04em] tabular-nums">{all.length}</span>
                <span className="text-[11px] text-mut">{all.length === 1 ? "auto disponible" : "autos disponibles"}</span>
              </div>
              <div className="flex flex-col gap-[7px]">
                <span className="text-[35px] tracking-[-0.04em]">3D</span>
                <span className="text-[11px] text-mut">por fuera y por dentro</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="flex min-w-0 flex-1 flex-col justify-between gap-6 border-line lg:border-l lg:pl-12">
            <p className="text-[clamp(20px,2.2vw,25px)] leading-[1.5] tracking-[-0.025em]">“Lo que ves en el visor es lo que encuentras en el patio. Si algo no está perfecto, lo marcamos y te lo explicamos antes de que vengas.”</p>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px]">Nuestra promesa</span>
                <span className="text-[11px] text-mut">ASTOREL · Quito</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="contacto" aria-labelledby="contacto-t" className="container scroll-mt-14 py-[clamp(48px,6vw,72px)]">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-[120px]">
          <Reveal className="flex flex-col gap-6 lg:w-[540px] lg:shrink-0">
            <span className={EYEBROW}>04 / El siguiente paso es tuyo</span>
            <h2 id="contacto-t" className="text-balance text-[clamp(38px,5vw,54px)] leading-[1.1] tracking-[-0.05em]">De la pantalla<br />al volante.</h2>
            <p className="max-w-[450px] text-sm leading-[1.7] text-mut">¿Encontraste tu próximo auto o necesitas orientación? Conversemos y agenda una visita al patio.</p>
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-[13px] underline-offset-4 hover:underline focus-visible:outline-fg">
              {phone ? `WhatsApp ${phone}` : "Escríbenos por WhatsApp"}
              <ArrowUpRight className="size-4" strokeWidth={1.4} aria-hidden="true" />
            </a>
          </Reveal>
          <Reveal delay={0.1} className="flex min-w-0 flex-1">
            <ContactForm interests={all.map((v) => `${v.brand} ${v.model} ${v.year}`)} />
          </Reveal>
        </div>
      </section>
    </>
  );
}
