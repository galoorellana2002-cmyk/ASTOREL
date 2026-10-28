import Link from "next/link";
import { CarArt } from "./CarArt";
import { Stripe } from "./Stripe";
import { PATIO_NAME, waLink } from "@/lib/format";

const MENU = [
  { href: "/autos", label: "Autos del patio" },
  { href: "/#visor", label: "Visor 3D" },
  { href: "/#confianza", label: "Ficha legal" },
  { href: "/#proceso", label: "Cómo comprar" },
  { href: "/#contacto", label: "Contacto" },
];

const smallCls = "block py-1 text-[15px] text-white/90 underline-offset-4 transition hover:text-white hover:underline focus-visible:outline-white";

/** El reverso de la hoja: el auto en grande a un lado y el menú al otro. */
export function Footer() {
  const wa = waLink("Hola, quiero información sobre los autos del patio.");
  return (
    <footer className="bg-band text-band-fg">
      <Stripe className="h-2" />
      <div className="grid md:min-h-[min(100svh,860px)] md:grid-cols-2">
        <div aria-hidden="true" className="relative h-[50svh] overflow-hidden bg-[radial-gradient(ellipse_80%_70%_at_40%_70%,#34353b_0%,#0b0b0d_72%)] md:h-auto">
          <div className="absolute -bottom-[6%] -left-[38%] w-[170%] md:-left-[30%] md:w-[150%]">
            <CarArt type="sedan" hex="#d8d9dd" />
          </div>
        </div>
        <div className="flex flex-col gap-14 px-4 pb-8 pt-12 sm:px-6 md:px-[8%] md:pt-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-astorel-blanco.svg" alt={PATIO_NAME} className="h-5 w-auto self-start" />
          <nav aria-label="Pie de página" className="group/menu flex flex-col gap-4 md:gap-5">
            {MENU.map((m) => (
              <Link
                key={m.label}
                href={m.href}
                className="w-fit text-[clamp(32px,2.4vw,34px)] leading-tight tracking-tight transition duration-300 hover:translate-x-3 focus-visible:outline-white group-hover/menu:text-band-mut group-hover/menu:hover:text-white"
              >
                {m.label}
              </Link>
            ))}
          </nav>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="mb-2 text-[15px] text-band-mut">Escríbenos</h2>
              <a className={smallCls} href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
              <a className={smallCls} href={wa} target="_blank" rel="noopener noreferrer">Coordinar una visita</a>
            </div>
            <div>
              <h2 className="mb-2 text-[15px] text-band-mut">Por tipo</h2>
              <Link className={smallCls} href="/autos?tipo=SUV">SUV</Link>
              <Link className={smallCls} href="/autos?tipo=Sedán">Sedán</Link>
              <Link className={smallCls} href="/autos?tipo=Camioneta">Camioneta</Link>
            </div>
          </div>
          <div className="mt-auto flex flex-col gap-1 text-[13px] text-band-mut">
            <span>
              © {new Date().getFullYear()} {PATIO_NAME}. Los defectos y la ficha legal son referenciales. Confirma siempre en la visita.
            </span>
            <Link href="/admin" className="inline-flex min-h-11 w-fit items-center underline underline-offset-[3px] transition hover:text-white focus-visible:outline-white">
              Acceso administrador
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
