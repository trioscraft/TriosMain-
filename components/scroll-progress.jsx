"use client"

import { motion, useScroll, useSpring } from "framer-motion"

// Slim HUD-style scroll progress bar pinned to the very top of the viewport.
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed left-0 right-0 top-0 z-[60] h-1 origin-left rounded-full bg-gradient-to-r from-[var(--neu-accent)] via-[var(--neu-accent-strong)] to-[var(--neu-gold)]"
    />
  )
}
