"use client"

import { motion } from "framer-motion"
import Button from "@/components/ui/button"

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

export default function Hero({
  title,
  subtitle,
  primaryCTA = { label: "Get in touch", href: "/contact" },
  secondaryCTA = { label: "See our work", href: "/projects" },
}) {
  return (
    <section className="container-width section relative overflow-hidden">
      {/* Animated mesh-gradient backdrop — blurred color blobs that drift
          slowly via the `float` keyframes defined in tailwind.config.js.
          Purely decorative: aria-hidden, pointer-events disabled. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="mesh-bg animate-gradient-shift bg-[length:200%_200%]" />
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl animate-float" />
        <div className="absolute right-1/4 bottom-0 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl animate-float-delayed" />
        <div className="noise-overlay" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto max-w-4xl text-center"
      >
        <motion.h1
          variants={item}
          className="text-fluid-3xl font-extrabold tracking-tight text-slate-900 dark:text-white"
        >
          <span className="block">{title}</span>
          <span className="block text-fade-animated bg-[length:200%_200%]">
            Trios Craft
          </span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-2xl text-fluid-lg text-slate-600 dark:text-slate-400"
        >
          {subtitle}
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild variant="primary" size="lg">
            <a href={primaryCTA.href}>{primaryCTA.label}</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={secondaryCTA.href}>{secondaryCTA.label}</a>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  )
}