import Link from "next/link";
import { PATIO_NAME, waLink } from "@/lib/format";

export function Footer() {
  const wa = waLink("Hola, quiero información sobre los autos del patio.");
  return (
    <footer>
      <div className="wrap">
        <a className="top-link" href="#top">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
          Volver arriba
        </a>
        <div className="f-cols">
          <div><h4>Autos</h4><Link href="/autos">Todos los autos</Link><Link href="/autos?tipo=SUV">SUV</Link><Link href="/autos?tipo=Sedán">Sedán</Link><Link href="/autos?tipo=Camioneta">Camioneta</Link></div>
          <div><h4>Confianza</h4><Link href="/#confianza">Revisión de detalles</Link><Link href="/#confianza">Ficha legal</Link><Link href="/autos">Recorrido en 3D</Link></div>
          <div><h4>Contacto</h4><a href={wa} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a><a href={wa} target="_blank" rel="noopener noreferrer">Coordinar una visita</a></div>
        </div>
        <div className="f-legal">
          <span className="brand-foot">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/brand/logo-astorel-blanco.svg" alt={PATIO_NAME} /></span>
          <span>© {new Date().getFullYear()} {PATIO_NAME}</span>
          <span>Los defectos y la ficha legal son referenciales. Confirma siempre en la visita.</span>
          <Link href="/admin" className="f-admin">Acceso administrador</Link>
        </div>
      </div>
    </footer>
  );
}
