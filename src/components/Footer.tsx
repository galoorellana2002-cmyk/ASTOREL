import Link from "next/link";
import { ArrowUp } from "lucide-react";
import { PATIO_NAME, waLink } from "@/lib/format";

const linkCls = "block py-1 text-[15px] text-white/90 underline-offset-4 transition hover:text-white hover:underline focus-visible:outline-white";

export function Footer() {
  const wa = waLink("Hola, quiero información sobre los autos del patio.");
  return (
    <footer className="bg-band text-band-fg">
      <div className="container">
        <a href="#top" className="inline-flex min-h-11 items-center gap-2 border-b border-band-line py-5 text-sm text-band-mut transition hover:text-white focus-visible:outline-white sm:w-full">
          <ArrowUp className="size-4" aria-hidden="true" />
          Volver arriba
        </a>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-8 pb-9 pt-8">
          <div>
            <h4 className="mb-2.5 text-[13px] text-band-mut">Autos</h4>
            <Link className={linkCls} href="/autos">Todos los autos</Link>
            <Link className={linkCls} href="/autos?tipo=SUV">SUV</Link>
            <Link className={linkCls} href="/autos?tipo=Sedán">Sedán</Link>
            <Link className={linkCls} href="/autos?tipo=Camioneta">Camioneta</Link>
          </div>
          <div>
            <h4 className="mb-2.5 text-[13px] text-band-mut">Confianza</h4>
            <Link className={linkCls} href="/#confianza">Revisión de detalles</Link>
            <Link className={linkCls} href="/#confianza">Ficha legal</Link>
            <Link className={linkCls} href="/autos">Recorrido en 3D</Link>
          </div>
          <div>
            <h4 className="mb-2.5 text-[13px] text-band-mut">Contacto</h4>
            <a className={linkCls} href={wa} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a>
            <a className={linkCls} href={wa} target="_blank" rel="noopener noreferrer">Coordinar una visita</a>
          </div>
        </div>
        <div className="flex flex-col gap-2.5 border-t border-band-line pb-8 pt-6 text-xs text-band-mut">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-astorel-blanco.svg" alt={PATIO_NAME} className="mb-1 h-5 w-auto self-start" />
          <span>© {new Date().getFullYear()} {PATIO_NAME}</span>
          <span>Los defectos y la ficha legal son referenciales. Confirma siempre en la visita.</span>
          <Link href="/admin" className="inline-flex min-h-11 w-fit items-center underline underline-offset-[3px] transition hover:text-white focus-visible:outline-white">Acceso administrador</Link>
        </div>
      </div>
    </footer>
  );
}
