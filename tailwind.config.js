/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: { center: true, padding: "1rem" },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
      "7xl": "4.5rem",
      "8xl": "6.25rem",
    },
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
        secondary: {
          50: "#fff8ed",
          100: "#fff1e6",
          200: "#ffe2cc",
          300: "#ffc991",
          400: "#ff9f43",
          500: "#ff7a00",
          600: "#e06300",
          700: "#b34f00",
          800: "#8a3d00",
          900: "#6b2e00",
        },
      },
      boxShadow: {
        "shadow-sm": "0 1px 2px 0 rgb(15 23 42 / 0.05)",
        "shadow-soft":
          "0 4px 6px -1px rgb(15 23 42 / 0.06), 0 2px 4px -2px rgb(15 23 42 / 0.1)",
        "shadow-md": "0 8px 20px 0 rgb(15 23 42 / 0.08)",
        "shadow-lg":
          "0 12px 28px 0 rgb(15 23 42 / 0.1), 0 4px 12px 0 rgb(15 23 42 / 0.08)",
        "shadow-xl": "0 20px 40px 0 rgb(15 23 42 / 0.12)",
        "shadow-2xl": "0 24px 50px 0 rgb(15 23 42 / 0.15)",
        "shadow-glow": "0 0 20px -2px rgb(2 188 208 / 0.35)",
        "shadow-glow-secondary": "0 0 20px -2px rgb(255 122 0 / 0.35)",
        "shadow-premium": "0 12px 40px 0 rgb(15 23 42 / 0.12), 0 4px 16px 0 rgb(15 23 42 / 0.1)",
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
        "gradient-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        "gradient-x": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-8px) rotate(1deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-100%)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.6s ease-out forwards",
        "slide-up": "slide-up 0.6s ease-out forwards",
        "gradient-shift": "gradient-shift 8s ease-in-out infinite",
        "gradient-x": "gradient-x 6s ease-in-out infinite",
        "float": "float 7s ease-in-out infinite",
        shimmer: "shimmer 2.6s linear infinite",
        marquee: "marquee 14s linear infinite",
        "pulse-slow": "pulse 3s infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },
      borderRadius: {
        DEFAULT: "0.75rem",
        lg: "0.875rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
        "4xl": "2rem",
      },
      transitionTimingFunction: {
        easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "easing-out": "cubic-bezier(0.25, 0.1, 0.25, 1)",
        "easing-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      maxWidth: {
        "8xl": "90rem",
        "9xl": "100rem",
      },
      zIndex: {
        60: "60",
      },
      backgroundImage: {
        "mesh-primary":
          "radial(ellipse at 50% 0%, theme(colors.primary.300) 0%, transparent 55%)",
        "mesh-secondary":
          "radial(ellipse at 50% 0%, theme(colors.secondary.300) 0%, transparent 55%)",
      },
    },
  },
  plugins: [],
}
