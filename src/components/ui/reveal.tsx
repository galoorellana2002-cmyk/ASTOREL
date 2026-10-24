"use client";

import * as React from "react";
import { motion, MotionConfig, useScroll, useSpring } from "framer-motion";

/** Aparición suave al hacer scroll. Respeta «reducir movimiento» del sistema. */
export function Reveal({ children, delay = 0, y = 24, className, as = "div" }: { children: React.ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "li" | "section" }) {
  const M = motion[as];
  return (
    <M className={className} initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -8% 0px" }} transition={{ duration: 0.8, delay, ease: [0.2, 0.7, 0.2, 1] }}>
      {children}
    </M>
  );
}

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** Barra fina de progreso de lectura, arriba del todo. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return <motion.div aria-hidden="true" style={{ scaleX, top: "env(safe-area-inset-top, 0px)" }} className="pointer-events-none fixed inset-x-0 z-[65] h-[2px] origin-left bg-white mix-blend-difference" />;
}
