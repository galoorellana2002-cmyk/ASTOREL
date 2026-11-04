import type { Metadata } from "next";
import Link from "next/link";
import { PATIO_NAME, WHATSAPP, waLink } from "@/lib/format";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Cómo ${PATIO_NAME} trata tus datos personales, conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador.`,
};

// Última revisión del texto. Actualízala cuando cambies la política.
const UPDATED = "4 de noviembre de 2026";

const LEGAL_NAME = process.env.NEXT_PUBLIC_LEGAL_NAME || "";
const LEGAL_RUC = process.env.NEXT_PUBLIC_LEGAL_RUC || "";
const EMAIL = process.env.NEXT_PUBLIC_PRIVACY_EMAIL || "";

function H({ n, children }: { n: number; children: React.ReactNode }) {
  return <h2 className="mt-10 text-[22px] tracking-tight">{n}. {children}</h2>;
}
const P = ({ children }: { children: React.ReactNode }) => <p className="mt-3 text-[15px] leading-relaxed text-mut">{children}</p>;
const UL = ({ children }: { children: React.ReactNode }) => <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-[15px] leading-relaxed text-mut">{children}</ul>;

export default function PrivacidadPage() {
  const wa = waLink("Hola, quiero ejercer mis derechos sobre mis datos personales.");
  return (
    <div className="container pb-24 pt-[clamp(40px,6vw,72px)]">
      <article className="max-w-[760px]">
        <p className="text-[11px] tracking-[.16em] text-mut">LEGAL</p>
        <h1 className="mt-3 text-[clamp(34px,5vw,56px)] leading-[1.05] tracking-tightest">Política de privacidad y protección de datos personales</h1>
        <p className="mt-4 text-[13px] text-mut">Última actualización: {UPDATED}</p>
        <P>
          En {PATIO_NAME} cuidamos tus datos. Esta política explica qué información recogemos cuando usas este sitio, para qué la usamos, con quién la compartimos
          y cómo puedes ejercer tus derechos, conforme a la Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP) y su reglamento.
        </P>

        <H n={1}>Quién es el responsable</H>
        <P>
          El responsable del tratamiento es {LEGAL_NAME || PATIO_NAME}
          {LEGAL_RUC ? ` (RUC ${LEGAL_RUC})` : ""}, patio de venta de vehículos ubicado en Quito, Ecuador.
        </P>
        <UL>
          {WHATSAPP && <li>WhatsApp: <a className="underline underline-offset-[3px]" href={wa} target="_blank" rel="noopener noreferrer">+{WHATSAPP}</a></li>}
          {EMAIL && <li>Correo: <a className="underline underline-offset-[3px]" href={`mailto:${EMAIL}`}>{EMAIL}</a></li>}
          <li>Dirección: Quito, Ecuador (te la indicamos al coordinar tu visita).</li>
        </UL>

        <H n={2}>Qué datos recogemos</H>
        <UL>
          <li><strong className="font-normal text-fg">Chat del sitio:</strong> los mensajes que escribes y, si los compartes, tu nombre, teléfono y correo. También registramos de forma básica qué autos viste y cuántas veces abriste el visor 3D, para atenderte mejor.</li>
          <li><strong className="font-normal text-fg">Solicitud de reserva:</strong> tu nombre, tu celular y el comentario opcional que escribas.</li>
          <li><strong className="font-normal text-fg">Formulario de contacto:</strong> nombre, teléfono, correo (opcional) y tu interés. Estos datos se envían por WhatsApp a nuestro asesor; el formulario no los guarda en nuestra base de datos.</li>
          <li><strong className="font-normal text-fg">Datos técnicos:</strong> tu dirección IP, que usamos solo de forma temporal para limitar abusos (por ejemplo, demasiados mensajes seguidos).</li>
        </UL>
        <P>No pedimos datos de tarjetas, cuentas bancarias ni cédula. No recogemos datos de menores de edad; este sitio no está dirigido a menores de 18 años.</P>

        <H n={3}>Para qué usamos tus datos</H>
        <UL>
          <li>Responder tus consultas y atenderte por chat o WhatsApp.</li>
          <li>Gestionar tu solicitud de reserva y coordinar la visita o la compra de un vehículo.</li>
          <li>Darte seguimiento comercial sobre los autos por los que preguntaste.</li>
          <li>Proteger el sitio contra abusos y mantener su seguridad.</li>
        </UL>
        <P>No vendemos tus datos ni los usamos para enviarte publicidad de terceros. No tomamos decisiones automatizadas que produzcan efectos jurídicos sobre ti.</P>

        <H n={4}>Base legal</H>
        <P>
          Tratamos tus datos con tu <strong className="font-normal text-fg">consentimiento</strong>, que das de forma libre, específica, informada e inequívoca al escribir en el chat
          o al marcar la casilla de los formularios, y para <strong className="font-normal text-fg">atender tu solicitud previa a una compra</strong>.
          Puedes retirar tu consentimiento en cualquier momento, sin que eso afecte lo ya realizado.
        </P>

        <H n={5}>Con quién compartimos tus datos</H>
        <P>Solo con proveedores que nos prestan servicios técnicos para operar el sitio, bajo sus propias condiciones de seguridad:</P>
        <UL>
          <li><strong className="font-normal text-fg">Supabase</strong>: base de datos y almacenamiento de fotos y modelos 3D.</li>
          <li><strong className="font-normal text-fg">Vercel</strong>: alojamiento del sitio.</li>
          <li><strong className="font-normal text-fg">Anthropic</strong>: si el chat responde con inteligencia artificial, el texto de tus mensajes se procesa con ese servicio para redactar la respuesta. No escribas datos sensibles en el chat.</li>
          <li><strong className="font-normal text-fg">WhatsApp (Meta)</strong>: cuando decides escribirnos por ese canal.</li>
        </UL>
        <P>
          Algunos de estos proveedores procesan datos fuera del Ecuador (por ejemplo, en Estados Unidos). Lo hacemos únicamente con proveedores que ofrecen
          medidas de seguridad adecuadas y para los fines descritos aquí. También podríamos compartir datos si una autoridad competente lo exige conforme a la ley.
        </P>

        <H n={6}>Cuánto tiempo los conservamos</H>
        <P>
          Conservamos tus datos mientras mantengamos contacto contigo y, después, hasta 24 meses desde tu última interacción. Pasado ese tiempo los eliminamos o los anonimizamos,
          salvo que una ley nos obligue a conservarlos más tiempo. Si pides la eliminación antes, la atendemos según el punto 7.
        </P>

        <H n={7}>Tus derechos</H>
        <P>La LOPDP te reconoce, entre otros, estos derechos:</P>
        <UL>
          <li><strong className="font-normal text-fg">Información y acceso:</strong> saber qué datos tuyos tenemos y cómo los usamos.</li>
          <li><strong className="font-normal text-fg">Rectificación y actualización:</strong> corregir datos inexactos o desactualizados.</li>
          <li><strong className="font-normal text-fg">Eliminación:</strong> pedir que borremos tus datos.</li>
          <li><strong className="font-normal text-fg">Oposición:</strong> oponerte a que los tratemos para un fin determinado.</li>
          <li><strong className="font-normal text-fg">Portabilidad:</strong> recibir tus datos en un formato estructurado.</li>
          <li><strong className="font-normal text-fg">Suspensión del tratamiento:</strong> pedir que dejemos de usarlos temporalmente en los casos que la ley prevé.</li>
          <li><strong className="font-normal text-fg">No ser objeto de decisiones basadas únicamente en tratamientos automatizados.</strong></li>
        </UL>
        <P>
          Para ejercerlos, escríbenos por {WHATSAPP ? "WhatsApp" : "nuestros canales de contacto"}{EMAIL ? " o por correo" : ""} indicando tu nombre y el teléfono con el que nos contactaste,
          para poder ubicar tus datos. Responderemos en un máximo de 15 días. Si necesitamos aclarar tu solicitud, te lo diremos dentro de los primeros 5 días.
          El ejercicio de tus derechos es gratuito.
        </P>
        <P>
          Si consideras que no atendimos bien tu solicitud, puedes presentar un reclamo ante la Autoridad de Protección de Datos Personales del Ecuador
          (Superintendencia de Protección de Datos Personales).
        </P>

        <H n={8}>Cómo protegemos tus datos</H>
        <UL>
          <li>Conexión cifrada (HTTPS) en todo el sitio.</li>
          <li>Acceso a la información solo para personal autorizado, con contraseña protegida y sesión que caduca.</li>
          <li>Base de datos con acceso restringido y límites contra intentos abusivos.</li>
        </UL>
        <P>Ningún sistema es totalmente infalible. Si ocurriera una vulneración que afecte tus datos, te lo comunicaremos y avisaremos a la autoridad conforme a la ley.</P>

        <H n={9}>Cookies</H>
        <P>
          Este sitio no usa cookies de publicidad ni de seguimiento. Solo usa una cookie técnica de sesión para el acceso del personal administrador,
          y almacenamiento local en tu navegador para recordar tu conversación del chat y los autos que has visto. Puedes borrarlos desde la configuración de tu navegador.
        </P>

        <H n={10}>Cambios en esta política</H>
        <P>Podemos actualizar esta política. Publicaremos la versión vigente en esta página, con su fecha de actualización.</P>

        <p className="mt-12 text-[13px] text-mut">
          <Link href="/" className="underline underline-offset-[3px]">Volver al inicio</Link>
        </p>
      </article>
    </div>
  );
}
