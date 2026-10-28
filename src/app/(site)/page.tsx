import { SplitLanding } from "@/components/SplitLanding";
import { CarArt } from "@/components/CarArt";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { getCatalog } from "@/lib/vehicles";
import { waLink } from "@/lib/format";

export const dynamic = "force-dynamic";
export const metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const vehicles = await getCatalog({}, 12);
  const wa = waLink("Hola, quiero coordinar una visita al patio.");

  return (
    <>
      <SplitLanding vehicles={vehicles} />

      {/* El cierre rompe la división: el auto a la izquierda, la invitación a la derecha. */}
      <section id="contacto" className="relative grid overflow-hidden bg-[radial-gradient(ellipse_70%_80%_at_28%_62%,#34353b_0%,#0b0b0d_72%)] text-white md:min-h-[90svh] md:grid-cols-2">
        <div aria-hidden="true" className="flex h-[70svh] items-center justify-center px-[6%] md:h-auto">
          <div className="spin w-[125%] max-w-[820px] md:w-full">
            <CarArt type="suv" hex="#d8d9dd" />
          </div>
        </div>
        <div className="flex flex-col justify-end bg-black px-5 pb-16 pt-10 md:bg-transparent md:px-12 md:pb-[14svh] lg:px-16">
          <Reveal>
            <h2 className="text-[clamp(40px,4.4vw,68px)] leading-[1.02] tracking-tightest">Ven a verlo en persona.</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-[38ch] text-[18px] leading-relaxed">Escríbenos por WhatsApp con el auto que elegiste y coordinamos la hora de tu visita al patio.</p>
          </Reveal>
          <Reveal delay={0.2} className="mt-8">
            <Button asChild variant="light" size="lg" className="max-md:w-full">
              <a href={wa} target="_blank" rel="noopener noreferrer">
                Coordinar una visita
              </a>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
