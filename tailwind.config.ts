import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

// Los colores salen de variables CSS (canales RGB) para que el modo oscuro y la opacidad (bg-fg/10) funcionen.
const c = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        bg: c("bg"),
        alt: c("alt"),
        card: c("card"),
        fg: c("fg"),
        mut: c("mut"),
        line: c("line"),
        hair: c("hair"),
        inv: c("inv"),
        "inv-fg": c("inv-fg"),
        ok: c("ok"),
        warn: c("warn"),
        bad: c("bad"),
        band: c("band"),
        "band-fg": c("band-fg"),
        "band-mut": c("band-mut"),
        "band-line": c("band-line"),
        vbg: c("vbg"),
        vcard: c("vcard"),
        vline: c("vline"),
        vfg: c("vfg"),
        vmut: c("vmut"),
      },
      borderColor: { DEFAULT: c("hair") },
      fontFamily: { sans: ["Questrial", '"Helvetica Neue"', "Arial", "sans-serif"] },
      letterSpacing: { tightest: "-0.025em" },
      boxShadow: {
        soft: "0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -8px rgb(0 0 0 / 0.10)",
        lift: "0 2px 4px rgb(0 0 0 / 0.04), 0 24px 48px -16px rgb(0 0 0 / 0.22)",
      },
      keyframes: {
        ping2: { from: { transform: "scale(.6)", opacity: "1" }, to: { transform: "scale(2.6)", opacity: "0" } },
        wheel: { from: { transform: "rotate(-540deg)" }, to: { transform: "none" } },
        fill: { to: { width: "100%" } },
        shimmer: { from: { backgroundPosition: "200% 0" }, to: { backgroundPosition: "-200% 0" } },
      },
      animation: {
        ping2: "ping2 1.9s ease-out infinite",
        wheel: "wheel 1.4s cubic-bezier(.2,.7,.2,1) both",
        fill: "fill 7s linear forwards",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [animate],
};
export default config;
