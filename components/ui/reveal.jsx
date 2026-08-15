"use client"

import { motion } from "framer-motion"

const directionOffset = {
  y: { y: 24 },
  x: { x: 24 },
  none: {},
}

export default function Reveal({
  children,
  delay = 0,
  direction = "y",
  offset = 24,
  once = true,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, ...(direction === "y" || direction === "x" ? { [direction]: offset } : {}) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
