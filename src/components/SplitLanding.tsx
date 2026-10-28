"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { CarArt } from "./CarArt";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { kmFmt, money, waLink } from "@/lib/format";
import type { VehicleCardData } from "@/lib/vehicles";
import { cn } from "@/lib/utils";

type Stage = "inicio" | "autos" | "detalles" | "legal" | "visor" | "proceso";

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
  { when: "Desde tu casa", rows: [["Eliges un auto del patio", "En línea"], ["Lo giras en el visor 3D", "En tu teléfono"], ["Lees defectos y ficha legal", "En su hoja"]] },
  { when: "Antes de venir", rows: [["Nos escribes por WhatsApp", "Tú eliges la hora"], ["Apartamos el auto para tu visita", "Por mensaje"]] },
  { when: "En el patio", rows: [["Ves el auto en persona", "Con su hoja"], ["Confirmas cada detalle marcado", "Uno por uno"]] },
];

const FALLBACK = { art: "sedan" as const, hex: "#d8d9dd" };
const STAGE_BG = "bg-[radial-gradient(ellipse_80%_70%_at_50%_58%,#34353b_0%,#0b0b0d_72%)]";

/** La portada en dos mitades: el auto queda fijo a la izquierda y cambia según la sección que se lee a la derecha. */
export function SplitLanding({ vehicles }: { vehicles: VehicleCardData[] }) {
  const shown = vehicles.slice(0, 4);
  const [pick, setPick] = useState(0);
  const [stage, setStage] = useState<Stage>("inicio");
  const col = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);

  // La sección que cruza el centro de la pantalla decide qué muestra el escenario.
  useEffect(() => {
    const nodes = col.current?.querySelectorAll<HTMLElement>("[data-stage]");
    if (!nodes?.length) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setStage(e.target.getAttribute("data-stage") as Stage)),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  // El nombre gigante se encoge un poco mientras la primera pantalla se va.
  const { scrollYProgress } = useScroll({ target: hero, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.93]);

  const v = shown[pick];
  const name = v ? `${v.brand} ${v.model} ${v.year}` : "";

  return (
    <div className="bg-black md:grid md:grid-cols-[47fr_53fr]">
      <aside aria-hidden="true" className="p-3 md:sticky md:top-[56px] md:h-[calc(100svh-56px)] md:self-start md:p-8">
        <div className={cn("relative h-[58svh] overflow-hidden rounded-[20px] md:h-full", STAGE_BG)}>
          <AnimatePresence initial={false}>
            <motion.div key={`${stage}-${v?.id ?? "x"}`} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7 }}>
              <StageView stage={stage} v={v} />
            </motion.div>
          </AnimatePresence>
        </div>
      </aside>

      <div ref={col} className="relative z-10 min-w-0">
        <section ref={hero} id="top" data-stage="inicio" className="flex flex-col bg-black text-white md:h-[calc(100svh-56px)]">
          <motion.h1
            style={{ scale }}
            className="-mt-[6vw] origin-bottom-left whitespace-nowrap px-4 text-[21vw] leading-[0.9] tracking-[-0.04em] md:order-2 md:-ml-[9vw] md:mb-10 md:mt-0 md:px-0 md:text-[clamp(120px,21.5vw,340px)]"
          >
            astorel<span className="sr-only">: autos usados con ficha legal y visor 3D</span>
          </motion.h1>
          <div className="flex flex-1 flex-col justify-center px-5 pb-12 pt-8 md:order-1 md:px-12 md:pt-[18svh] lg:px-16">
            <Reveal>
              <p className="max-w-[26ch] text-[clamp(20px,1.8vw,26px)] leading-snug">Autos usados con su ficha legal, sus defectos marcados y un recorrido en 3D, antes de que vengas.</p>
            </Reveal>
            <Reveal delay={0.1} className="mt-8">
              <Button asChild variant="light" size="lg">
                <Link href="/#autos">Ver los autos del patio</Link>
              </Button>
            </Reveal>
          </div>
        </section>

        <section id="autos" data-stage="autos" className="scroll-mt-14 bg-bg px-5 py-[clamp(88px,10vw,144px)] text-fg md:px-12 lg:px-16">
          <Reveal>
            <h2 className="text-[clamp(34px,3vw,44px)] leading-tight tracking-tightest">Elige un auto y míralo a la izquierda.</h2>
          </Reveal>
          {v ? (
            <>
              <div role="tablist" aria-label="Autos del patio" className="mt-8 flex flex-wrap gap-x-6 gap-y-1">
                {shown.map((c, i) => (
                  <button
                    key={c.id}
                    type="button"
                    role="tab"
                    aria-selected={i === pick}
                    onClick={() => setPick(i)}
                    className={cn("min-h-11 text-[18px] underline-offset-[8px] transition hover:text-fg", i === pick ? "text-fg underline decoration-2" : "text-mut")}
                  >
                    {c.brand} {c.model}
                  </button>
                ))}
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={v.id} role="tabpanel" aria-label={name} className="mt-10" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }}>
                  {/* En el teléfono la mitad fija ya quedó arriba: el auto elegido se muestra aquí. */}
                  <div className={cn("relative mb-8 aspect-[4/3] overflow-hidden rounded-[20px] md:hidden", STAGE_BG)}>
                    {v.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={v.coverUrl} alt={name} loading="lazy" className="absolute inset-0 size-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center px-[6%]">
                        <CarArt type={v.art} hex={v.hex} />
                      </div>
                    )}
                  </div>
                  <h3 className="text-[clamp(34px,3vw,44px)] leading-tight tracking-tight">{name}</h3>
                  <p className="mt-1 text-[clamp(34px,3vw,44px)] tabular-nums">{money(v.priceCents)}</p>
                  <ul className="mt-6 max-w-[46ch] text-[18px] leading-relaxed">
                    <li>
                      {kmFmt(v.km)}
                      {v.color ? ` · ${v.color}` : ""}
                      {v.version ? ` · ${v.version}` : ""}
                    </li>
                    <li>{v.defectCount === 0 ? "Sin detalles registrados" : `${v.defectCount} ${v.defectCount === 1 ? "detalle marcado" : "detalles marcados"} sobre el auto`}</li>
                    <li>{v.hasWarnings ? "Ficha legal con avisos" : "Ficha legal al día"}</li>
                    {v.status === "RESERVED" && <li>Reservado por otra persona</li>}
                  </ul>
                </motion.div>
              </AnimatePresence>
              <div className="mt-10 grid gap-3 lg:grid-cols-2">
                <Link href={`/autos/${v.slug}`} className="flex min-h-[64px] items-center justify-center rounded-lg bg-inv px-5 text-[17px] text-inv-fg transition hover:opacity-85 active:scale-[.98]">
                  Ver su hoja completa
                </Link>
                <a
                  href={waLink(`Hola, quiero información sobre el ${name}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[64px] items-center justify-center rounded-lg bg-fg/[.07] px-5 text-[17px] transition hover:bg-fg/[.12] active:scale-[.98]"
                >
                  Preguntar por este auto
                </a>
              </div>
            </>
          ) : (
            <p className="mt-8 text-[18px]">Pronto habrá autos nuevos en el patio.</p>
          )}
          <Link href="/autos" className="mt-8 inline-flex min-h-11 items-center text-[17px] underline underline-offset-4">
            Ver todos los autos del patio
          </Link>
        </section>

        <section id="confianza" className="bg-alt px-5 py-[clamp(88px,10vw,144px)] text-fg md:px-12 lg:px-16">
          <h2 className="sticky top-[56px] z-[1] -mx-5 bg-alt px-5 py-3 text-[clamp(40px,4.4vw,68px)] leading-[1.02] tracking-tightest md:static md:mx-0 md:px-0 md:py-0">Sin sorpresas al llegar.</h2>
          <div className="mt-14 flex flex-col gap-[clamp(72px,8vw,120px)]">
            <Block stage="detalles" title="Revisión de detalles" lines={["Pintura, llantas y tapizados, con fotos de cerca.", "Cada defecto, marcado sobre el auto.", "Con su zona y su gravedad.", "Lo que no se ve perfecto, explicado."]} />
            <Block stage="legal" title="Ficha legal clara" lines={["Matrícula y revisión técnica.", "Gravámenes y multas pendientes.", "Todo en una sola vista.", "Antes de pedir una visita."]} />
            <Block stage="visor" id="visor" title="Recorrido en 3D" lines={["Gira el auto por fuera y por dentro.", "Acércate a cada detalle marcado.", "Desde tu teléfono.", "O proyéctalo en tu calle con realidad aumentada."]}>
              <Button asChild size="lg" className="mt-8">
                <Link href="/autos">Probar el visor</Link>
              </Button>
            </Block>
          </div>
        </section>

        <section id="proceso" data-stage="proceso" className="bg-black px-5 py-[clamp(88px,10vw,144px)] text-white md:px-12 lg:px-16">
          <Reveal>
            <h2 className="text-[clamp(40px,4.4vw,68px)] leading-[1.02] tracking-tightest">Así compras aquí.</h2>
            <p className="mt-5 max-w-[34ch] text-[18px] leading-relaxed">Llegas al patio sabiendo qué vas a encontrar, porque ya lo leíste en la hoja de cada auto.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 max-w-[480px] bg-white px-6 pb-9 pt-8 text-[17px] text-black [clip-path:polygon(0_0,100%_0,100%_calc(100%-12px),95%_100%,90%_calc(100%-12px),85%_100%,80%_calc(100%-12px),75%_100%,70%_calc(100%-12px),65%_100%,60%_calc(100%-12px),55%_100%,50%_calc(100%-12px),45%_100%,40%_calc(100%-12px),35%_100%,30%_calc(100%-12px),25%_100%,20%_calc(100%-12px),15%_100%,10%_calc(100%-12px),5%_100%,0_calc(100%-12px))]">
              {SLIP.map((g, gi) => (
                <div key={g.when} className={gi ? "mt-7" : ""}>
                  <h3 className="text-black/60">{g.when}</h3>
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
        </section>
      </div>
    </div>
  );
}

function Block({ stage, id, title, lines, children }: { stage: Stage; id?: string; title: string; lines: string[]; children?: React.ReactNode }) {
  return (
    <Reveal>
      <div id={id} data-stage={stage} className="scroll-mt-20">
        <h3 className="text-[clamp(24px,1.8vw,26px)] leading-tight tracking-tight">{title}</h3>
        <ul className="mt-5 flex max-w-[46ch] flex-col gap-3.5 text-[18px] leading-snug">
          {lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        {children}
      </div>
    </Reveal>
  );
}

/** Lo que muestra la mitad fija en cada momento de la lectura. */
function StageView({ stage, v }: { stage: Stage; v?: VehicleCardData }) {
  const art = v ?? FALLBACK;

  if (stage === "detalles") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-8 px-[8%]">
        <div className="w-full max-w-[620px]">
          <CarArt type="suv" hex="#b4b6bc" dots={[[300, 92], [486, 150], [420, 60]]} />
        </div>
        <ul className="w-full max-w-[460px] rounded-xl bg-vcard px-5 py-4 text-[15px] text-vfg">
          {DEFECTOS.map(([zona, nota]) => (
            <li key={zona} className="flex justify-between gap-4 py-1">
              <span>{zona}</span>
              <span className="text-vmut">{nota}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (stage === "legal") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-[8%]">
        <div className="w-full max-w-[420px] opacity-60">
          <CarArt type="suv" hex="#b4b6bc" />
        </div>
        <div className="w-full max-w-[380px] rounded-[20px] bg-white p-6 text-black">
          <p className="text-[22px]">Kia Sportage 2019</p>
          {FICHA.map(([k, val]) => (
            <p key={k} className="flex items-center gap-3 py-2 text-[15px]">
              <i className="size-2.5 shrink-0 rounded-full bg-[#1d8a4a]" />
              {k}
              <span className="ml-auto">{val}</span>
            </p>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {v?.coverUrl && stage !== "visor" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={v.coverUrl} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center px-[8%]">
          <div className="spin w-full max-w-[680px]">
            <CarArt type={art.art} hex={art.hex} dots={stage === "visor" ? [[300, 92], [486, 150]] : undefined} />
          </div>
        </div>
      )}
      {v && (
        <p className="absolute inset-x-4 bottom-4 flex items-baseline justify-between gap-3 rounded-xl bg-black/75 px-4 py-3 text-[15px] text-white">
          <span>
            {v.brand} {v.model} {v.year} · {kmFmt(v.km)}
          </span>
          <span className="tabular-nums">{money(v.priceCents)}</span>
        </p>
      )}
    </>
  );
}
