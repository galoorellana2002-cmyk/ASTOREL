import Link from "next/link";
import { Wordmark } from "@/components/Wordmark";
import { PATIO_NAME, waLink } from "@/lib/format";

const linkCls = "inline-flex min-h-8 items-center text-[11px] text-band-mut underline-offset-4 transition hover:text-white hover:underline focus-visible:outline-white";

export function Footer() {
  const wa = waLink("Hola, quiero información sobre los autos del patio.");
  return (
    <footer className="bg-band text-band-fg">
      <div className="container pb-7 pt-[46px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="flex flex-col gap-[15px]">
            <Wordmark name={PATIO_NAME} className="h-5 self-start text-white" />
            <p className="text-xs text-band-mut">Una nueva perspectiva para elegir.</p>
          </div>
          <div className="flex flex-col gap-2.5 text-[11px]">
            <h4 className="tracking-[.1em]">VISÍTANOS</h4>
            <p className="leading-[1.8] text-band-mut">Quito, Ecuador<br />Coordina tu visita por WhatsApp</p>
            <a className={linkCls} href={wa} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a>
          </div>
          <div className="flex flex-col gap-1 text-[11px]">
            <h4 className="mb-1.5 tracking-[.1em]">EXPLORA</h4>
            <Link className={linkCls} href="/autos">Inventario</Link>
            <Link className={linkCls} href="/#visor">Experiencia 3D</Link>
            <Link className={linkCls} href="/#beneficios">Cómo comprar</Link>
            <Link className={linkCls} href="/#contacto">Contacto</Link>
          </div>
        </div>
        <div className="mt-[38px] flex flex-col gap-2 border-t border-band-line pt-[22px] text-[9px] text-band-mut sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {PATIO_NAME}. Todos los derechos reservados.</span>
          <span>Los defectos y la ficha legal son referenciales. Confirma siempre en la visita.</span>
          <Link href="/admin" className="inline-flex min-h-11 w-fit items-center underline underline-offset-[3px] transition hover:text-white focus-visible:outline-white">Acceso administrador</Link>
        </div>
      </div>
    </footer>
  );
}
