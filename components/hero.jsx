"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
import Button from "@/components/ui/button"
import Typewriter from "@/components/ui/typewriter"
import { Sparkles, ArrowRight, Cpu, Cloud, Atom, Smartphone } from "lucide-react"

// Staggered entrance: heading, subtitle, and CTAs cascade in rather than
// appearing all at once. `container` drives the stagger timing for its
// `item` children below.
const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

const chips = [
  { label: "AI Systems", icon: Atom, pos: "top-[16%] left-[8%]", anim: "animate-float" },
  { label: "Next.js", icon: Sparkles, pos: "top-[22%] right-[10%]", anim: "animate-float-delayed" },
  { label: "Cloud", icon: Cloud, pos: "bottom-[24%] left-[12%]", anim: "animate-float-delayed" },
  { label: "Mobile", icon: Smartphone, pos: "bottom-[18%] right-[8%]", anim: "animate-float" },
]

export default function Hero({
  title,
  subtitle,
  primaryCTA = { label: "Get in touch", href: "/contact" },
  secondaryCTA = { label: "See our work", href: "/projects" },
}) {
  const glowRef = useRef(null)

  const handleMove = (e) => {
    const el = glowRef.current
    if (!el) return
    const rect = e.currentTarget.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`)
    el.style.setProperty("--my", `${e.clientY - rect.top}px`)
  }

  return (
    <section
      onMouseMove={handleMove}
      className="container-width section relative overflow-hidden pb-24 pt-20 md:pt-28"
    >
      {/* Tech backdrop — grid, aurora, cursor glow, scanline, grain */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="tech-grid absolute inset-0 opacity-60" />
        <div className="aurora-bg">
          <div className="aurora-blob left-[8%] top-[6%] h-72 w-72 bg-primary-500/30 animate-aurora" />
          <div className="aurora-blob right-[10%] top-[14%] h-80 w-80 bg-secondary-500/25 animate-aurora-slow" />
          <div className="aurora-blob bottom-[2%] left-1/2 h-72 w-72 -translate-x-1/2 bg-luxe-400/20 animate-aurora" />
        </div>
        <div
          ref={glowRef}
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(600px circle at var(--mx, 50%) var(--my, 50%), rgb(2 187 208 / 0.14), transparent 42%)",
          }}
        />
        <div className="scanline animate-scan opacity-50" />
        <div className="noise-overlay" />
      </div>

      {/* Floating tech chips — large screens only (avoid tablet/phone overlap) */}
      {chips.map((c) => (
        <div
          key={c.label}
          className={`absolute z-0 hidden items-center gap-1.5 rounded-full glass-surface px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 lg:flex ${c.pos} ${c.anim}`}
        >
          <c.icon className="h-3.5 w-3.5 text-luxe-400" />
          {c.label}
        </div>
      ))}

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-4xl text-center"
      >
        <motion.div variants={item} className="mb-6 flex justify-center px-4">
          <span className="glass-surface inline-flex max-w-[90vw] items-center gap-2 rounded-full px-4 py-1.5 text-center text-xs font-medium text-slate-700 dark:text-slate-200">
            <Cpu className="h-3.5 w-3.5 shrink-0 text-primary-400" />
            AI-native studio · Built by 3 CS grads
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="font-display break-words text-fluid-3xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white"
        >
          <span className="block">{title}</span>
          <span className="block text-fade-animated bg-[length:220%_220%]">
            Trios Craft
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-4 text-fluid-base font-medium text-primary-700 dark:text-luxe-200"
        >
          We engineer{" "}
          <Typewriter
            words={[
              "AI-powered web apps",
              "smart mobile experiences",
              "cloud & devops automation",
              "interfaces that feel alive",
            ]}
          />
        </motion.p>

        <motion.p
          variants={item}
          className="mx-auto mt-4 max-w-2xl text-fluid-lg text-slate-600 dark:text-slate-300"
        >
          {subtitle}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild variant="primary" size="lg" className="group shadow-glow">
            <a href={primaryCTA.href}>
              {primaryCTA.label}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={secondaryCTA.href}>{secondaryCTA.label}</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}
