"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/** Número que sube hasta su valor al entrar en pantalla. */
export function CountUp({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [n, setN] = useState(value);
  useEffect(() => {
    if (!inView || reduce || value < 2) return;
    setN(0);
    const c = animate(0, value, { duration: 1.2, ease: [0.2, 0.7, 0.2, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduce, value]);
  return <span ref={ref} className={className}>{n}</span>;
}
