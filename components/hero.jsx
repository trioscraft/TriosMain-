"use client"

import { motion } from "framer-motion"
import Button from "@/components/ui/button"

export default function Hero({
  title,
  subtitle,
  primaryCTA = { label: "Get in touch", href: "/contact" },
  secondaryCTA = { label: "See our work", href: "/projects" },
}) {
  return (
    <section className="container-width section mesh-aura">
      <motion.div
        variants={{
          show: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
        }}
        initial="initial"
        animate="show"
        className="mx-auto flex flex-col items-center text-center"
      >
        <motion.h1
          variants={{ initial: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-fluid-hero font-extrabold tracking-tight text-slate-900"
        >
          {title}
        </motion.h1>

        <motion.span
          variants={{ initial: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-2 block text-4xl font-extrabold tracking-tight"
        >
          <span className="text-fade">Trios Craft</span>
        </motion.span>

        <motion.p
          variants={{ initial: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400"
        >
          {subtitle}
        </motion.p>

        <motion.div
          variants={{ initial: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
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
