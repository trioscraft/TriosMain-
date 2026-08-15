/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f2f3",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#02bbd0",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        // Warm accent used sparingly for gradients, glows, and highlights
        // so the palette doesn't read as flat single-hue cyan everywhere.
        accent: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
          900: "#7c2d12",
        },
        // Deep violet secondary — pairs with cyan for a richer, more
        // premium gradient range in dark-luxe compositions.
        secondary: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
          800: "#3730a3",
          900: "#312e81",
        },
        // Champagne gold — the signature "luxe" accent. Used only for
        // highlights, hairline dividers, and the wordmark gradient so the
        // dark canvas never feels flat or purely techy.
        luxe: {
          50: "#fdf9f0",
          100: "#faf0d8",
          200: "#f3e0b2",
          300: "#e9c988",
          400: "#dcae5e",
          500: "#c99537",
          600: "#b07d28",
          700: "#8f6220",
          800: "#754e1f",
          900: "#62421d",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Inter", "system-ui", "sans-serif"],
        mono: ["Fira Code", "mono", "monospace"],
      },
      // Fluid, clamp()-based sizes so hero/section headings scale smoothly
      // across the viewport instead of jumping at each Tailwind breakpoint.
      fontSize: {
        "fluid-sm": ["clamp(0.875rem, 0.8rem + 0.3vw, 1rem)", { lineHeight: "1.6" }],
        "fluid-base": ["clamp(1rem, 0.95rem + 0.3vw, 1.125rem)", { lineHeight: "1.7" }],
        "fluid-lg": ["clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem)", { lineHeight: "1.5" }],
        "fluid-xl": ["clamp(1.75rem, 1.4rem + 1.4vw, 2.5rem)", { lineHeight: "1.2" }],
        "fluid-2xl": ["clamp(2.25rem, 1.7rem + 2.2vw, 3.5rem)", { lineHeight: "1.1" }],
        "fluid-3xl": ["clamp(2.75rem, 1.9rem + 3.4vw, 4.75rem)", { lineHeight: "1.05" }],
      },
      // Colored, low-opacity shadows instead of default flat gray —
      // reach for these on cards/buttons instead of Tailwind's shadow-* defaults.
      boxShadow: {
        soft: "0 2px 8px -2px rgb(15 23 42 / 0.06), 0 8px 24px -8px rgb(15 23 42 / 0.08)",
        "soft-dark": "0 2px 8px -2px rgb(0 0 0 / 0.3), 0 8px 24px -8px rgb(0 0 0 / 0.4)",
        glow: "0 0 0 1px rgb(2 187 208 / 0.15), 0 8px 30px -6px rgb(2 187 208 / 0.35)",
        "glow-accent": "0 0 0 1px rgb(249 115 22 / 0.15), 0 8px 30px -6px rgb(249 115 22 / 0.35)",
        "glow-luxe": "0 0 0 1px rgb(201 149 55 / 0.22), 0 8px 34px -6px rgb(201 149 55 / 0.40)",
        "glow-violet": "0 0 0 1px rgb(99 102 241 / 0.18), 0 8px 30px -6px rgb(99 102 241 / 0.38)",
        premium:
          "0 1px 2px rgb(15 23 42 / 0.04), 0 12px 32px -8px rgb(15 23 42 / 0.12), 0 24px 64px -16px rgb(2 187 208 / 0.15)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      backgroundImage: {
        "mesh-gradient":
          "radial-gradient(at 20% 20%, rgb(2 187 208 / 0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgb(249 115 22 / 0.15) 0px, transparent 50%), radial-gradient(at 50% 80%, rgb(14 116 144 / 0.2) 0px, transparent 50%)",
        shimmer: "linear-gradient(110deg, transparent 30%, rgb(255 255 255 / 0.35) 50%, transparent 70%)",
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "pulse-slow": "pulse 3s infinite",
        float: "float 8s ease-in-out infinite",
        "float-delayed": "float 8s ease-in-out 2s infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        shimmer: "shimmer 2s linear infinite",
        marquee: "marquee 30s linear infinite",
        "marquee-slow": "marquee 45s linear infinite",
        aurora: "aurora 14s ease-in-out infinite",
        "aurora-slow": "aurora 22s ease-in-out infinite",
        spotlight: "spotlight 7s ease-in-out infinite",
        scan: "scan 7s linear infinite",
        shine: "shine 1.1s ease-in-out",
        "border-spin": "border-spin 6s linear infinite",
        "blink": "blink 1.1s step-end infinite",
        "pulse-ring": "pulse-ring 2.6s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(2%, -4%) scale(1.05)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundSize: "200% 200%", backgroundPosition: "0% 50%" },
          "50%": { backgroundSize: "220% 220%", backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        // Slowly drifting aurora blobs for the dark-luxe hero/section backdrops
        aurora: {
          "0%, 100%": { transform: "translate3d(0,0,0) scale(1)", opacity: "0.55" },
          "33%": { transform: "translate3d(6%,-4%,0) scale(1.15)", opacity: "0.8" },
          "66%": { transform: "translate3d(-5%,5%,0) scale(0.95)", opacity: "0.6" },
        },
        // A soft sweeping highlight used on premium cards/dividers
        spotlight: {
          "0%, 100%": { transform: "translateX(-60%) rotate(8deg)", opacity: "0" },
          "50%": { transform: "translateX(60%) rotate(8deg)", opacity: "0.6" },
        },
        // Vertical scanning line that sweeps a section (HUD / radar feel)
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "10%": { opacity: "0.7" },
          "90%": { opacity: "0.7" },
          "100%": { transform: "translateY(2000%)", opacity: "0" },
        },
        // Diagonal light sweep used on primary buttons on hover
        shine: {
          "0%": { transform: "translateX(-150%) skewX(-20deg)" },
          "100%": { transform: "translateX(250%) skewX(-20deg)" },
        },
        // Rotating conic gradient for animated card/divider borders
        "border-spin": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        // Terminal-style caret blink
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        // Expanding ring used on "live"/node indicators
        "pulse-ring": {
          "0%": { transform: "scale(0.8)", opacity: "0.7" },
          "80%, 100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
}