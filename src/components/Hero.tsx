"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CarArt } from "./CarArt";

const SLIDES = [
  { id: "s1", title: "Primero lo ves en 3D.", sub: "Cada auto del patio, por fuera y por dentro.", cta: "Probar el visor", href: "/autos" },
  { id: "s2", title: "Cada detalle, a la vista.", sub: "Rayones, llantas y tapizados marcados antes de que vengas.", cta: "Ver los autos", href: "/autos" },
  { id: "s3", title: "Ficha legal al día.", sub: "Matrícula, multas y revisión técnica verificadas.", cta: "Cómo funciona", href: "/#confianza" },
];

export function Hero() {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const x0 = useRef<number | null>(null);
  const go = (n: number) => setIdx((n + SLIDES.length) % SLIDES.length);

  return (
    <header className={`hero${paused ? " paused" : ""}`} id="top" role="region" aria-roledescription="carrusel" aria-label="Destacados del patio">
      <div
        className="slides"
        style={{ transform: `translateX(-${idx * 100}%)` }}
        onPointerDown={(e) => (x0.current = e.clientX)}
        onPointerUp={(e) => {
          if (x0.current === null) return;
          const dx = e.clientX - x0.current;
          x0.current = null;
          if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
        }}
        onPointerCancel={() => (x0.current = null)}
      >
        {SLIDES.map((s, i) => (
          <div key={s.id} className={`slide ${s.id}${i === idx ? " active" : ""}`} {...(i !== idx ? ({ inert: "" } as object) : {})}>
            {s.id === "s1" && (
              <div className="art-car spin" key={idx === 0 ? "on" : "off"}>
                <CarArt type="sedan" hex="#5d6066" />
              </div>
            )}
            {s.id === "s2" && (
              <div className="art-car">
                <CarArt type="suv" hex="#c4c7cc" dots={[[300, 92], [486, 150], [420, 60]]} />
              </div>
            )}
            {s.id === "s3" && (
              <div className="ficha" aria-hidden="true">
                <h3>
                  Kia Sportage 2019
                  <span className="seal">
                    <svg viewBox="0 0 24 24">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                  </span>
                </h3>
                <ul>
                  <li><i />Matrícula <span>Vigente</span></li>
                  <li><i />Gravámenes <span>Ninguno</span></li>
                  <li><i />Multas <span>$0</span></li>
                  <li><i />Revisión técnica <span>Al día</span></li>
                </ul>
              </div>
            )}
            <div className="wrap">
              <div className="txt">
                {i === 0 ? <h1 style={{ ["--i" as string]: 0 }}>{s.title}</h1> : <h2 style={{ ["--i" as string]: 0 }}>{s.title}</h2>}
                <p className="sub" style={{ ["--i" as string]: 1 }}>{s.sub}</p>
                <Link className="btn-o" style={{ ["--i" as string]: 2 }} href={s.href}>
                  {s.cta}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className="arrow prev" aria-label="Anterior" onClick={() => go(idx - 1)}>
        <svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <button type="button" className="arrow next" aria-label="Siguiente" onClick={() => go(idx + 1)}>
        <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
      </button>
      <div className="dashes">
        {SLIDES.map((s, i) => (
          <button key={s.id} type="button" className={`dash${i === idx ? " on" : ""}`} aria-label={`Ir a la diapositiva ${i + 1}`} aria-current={i === idx} onClick={() => go(i)}>
            <i onAnimationEnd={() => i === idx && go(idx + 1)} />
          </button>
        ))}
      </div>
      <button type="button" className="pause" aria-label={paused ? "Reanudar carrusel" : "Pausar carrusel"} onClick={() => setPaused((p) => !p)}>
        <svg className="ic-pause" viewBox="0 0 16 16"><rect x="3" y="2" width="3.4" height="12" rx="1" /><rect x="9.6" y="2" width="3.4" height="12" rx="1" /></svg>
        <svg className="ic-play" viewBox="0 0 16 16"><path d="M4 2l10 6-10 6z" /></svg>
      </button>
    </header>
  );
}
