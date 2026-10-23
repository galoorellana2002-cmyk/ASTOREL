"use client";

import { useEffect } from "react";

/** Barra de progreso, sombra del menú al bajar y aparición de secciones (.rv). */
export function Effects() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const prog = document.getElementById("prog");
    const nav = document.querySelector("nav.top");
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (prog) prog.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
        nav?.classList.toggle("scrolled", y > 8);
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();

    const els = Array.from(document.querySelectorAll<HTMLElement>(".rv"));
    let io: IntersectionObserver | null = null;
    if (reduce || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
    } else {
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            const el = e.target as HTMLElement;
            io?.unobserve(el);
            el.classList.add("in");
            setTimeout(() => el.classList.add("done"), 900);
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
      );
      els.forEach((el) => io?.observe(el));
    }
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io?.disconnect();
    };
  }, []);

  return <div className="progress" id="prog" />;
}
