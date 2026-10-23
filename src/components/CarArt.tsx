import type { CSSProperties } from "react";

const BODIES = {
  sedan: {
    body: "M30 150 L30 118 Q30 104 46 100 L110 92 Q130 60 170 42 Q190 34 215 34 L360 34 Q392 34 416 52 L470 92 L540 102 Q566 106 570 128 L570 150 Q570 158 562 158 L528 158 A38 38 0 0 0 452 158 L170 158 A38 38 0 0 0 94 158 L38 158 Q30 158 30 150 Z",
    glass: "M150 92 Q168 62 196 52 L262 52 L262 92 Z M278 52 L360 52 Q380 54 396 68 L430 92 L278 92 Z",
    line: "M270 52 V150",
  },
  suv: {
    body: "M30 150 L30 112 Q30 98 46 94 L104 86 Q124 48 164 30 Q184 22 212 22 L384 22 Q412 22 432 42 L476 88 L542 98 Q568 102 570 126 L570 150 Q570 158 562 158 L528 158 A38 38 0 0 0 452 158 L170 158 A38 38 0 0 0 94 158 L38 158 Q30 158 30 150 Z",
    glass: "M146 86 Q160 52 188 38 L262 38 L262 86 Z M278 38 L384 38 Q404 40 418 56 L448 86 L278 86 Z",
    line: "M270 38 V150",
  },
  pickup: {
    body: "M30 150 L30 100 L250 100 L250 60 Q250 46 270 42 L400 36 Q430 36 448 54 L480 92 L548 100 Q570 104 572 126 L572 150 Q572 158 564 158 L528 158 A38 38 0 0 0 452 158 L170 158 A38 38 0 0 0 94 158 L38 158 Q30 158 30 150 Z",
    glass: "M268 56 L398 50 Q416 50 430 66 L452 92 L268 92 Z",
    line: "M40 100 H250 M262 56 V150",
  },
} as const;

export type ArtType = keyof typeof BODIES;

function Wheel({ cx }: { cx: number }) {
  return (
    <g className="wh">
      <circle cx={cx} cy={158} r={34} fill="#1c1c1e" />
      <circle cx={cx} cy={158} r={19} fill="#d4d4d8" />
      <path d={`M${cx} 143v30M${cx - 15} 158h30`} stroke="#8e8e93" strokeWidth={3} fill="none" />
    </g>
  );
}

/** Silueta de ilustración. Se reemplaza por fotos reales cuando el auto tenga portada. */
export function CarArt({ type, hex, dots, style }: { type: ArtType; hex: string; dots?: Array<[number, number]>; style?: CSSProperties }) {
  const b = BODIES[type] ?? BODIES.sedan;
  return (
    <svg viewBox="0 0 600 200" aria-hidden="true" style={style}>
      <ellipse cx={300} cy={192} rx={250} ry={6} fill="rgba(0,0,0,.18)" />
      <path d={b.body} fill={hex} stroke="rgba(0,0,0,.25)" strokeWidth={1.5} />
      <path d={b.glass} fill="rgba(255,255,255,.55)" />
      <path d={b.line} stroke="rgba(0,0,0,.2)" strokeWidth={2} fill="none" />
      <Wheel cx={132} />
      <Wheel cx={490} />
      {dots?.map(([x, y]) => (
        <g key={`${x}-${y}`} className="dot-h" transform={`translate(${x} ${y})`}>
          <circle className="ring" r={10} />
          <circle r={6} fill="#fff" stroke="#010205" strokeWidth={2.5} />
        </g>
      ))}
    </svg>
  );
}
