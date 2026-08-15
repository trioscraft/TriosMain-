"use client"

import { motion } from "framer-motion"

/**
 * Reveal
 * Shared scroll-triggered entrance animation. Replaces the old pattern of
 * `className="animate-slide-up" style={{ animationDelay: ... }}` sprinkled
 * across every page. Animates once, respects prefers-reduced-motion via
 * framer-motion's built-in accessibility handling.
 *
 * Usage:
 *   <Reveal><ServiceCard service={service} /></Reveal>
 *   <Reveal delay={0.1} direction="up"><h2>Heading</h2></Reveal>
 *
 * For staggered grids, wrap the grid in <RevealGroup> and each item in
 * <Reveal> with no delay — RevealGroup staggers children automatically.
 */

const directionOffset = {
  up: { y: 24, x: 0 },
  down: { y: -24, x: 0 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  none: { x: 0, y: 0 },
}

export function Reveal({
  children,
  as: Component = motion.div,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className,
  once = true,
  amount = 0.2,
  ...props
}) {
  const offset = directionOffset[direction] ?? directionOffset.up

  return (
    <Component
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * RevealGroup
 * Wrap a set of direct children (e.g. a grid of cards) to stagger their
 * entrance automatically. Children should be motion-aware (Reveal or
 * anything using framer-motion's `variants`/parent-driven animation) —
 * simplest is to just wrap each grid item in <Reveal> as normal; RevealGroup
 * only adds the stagger container, individual <Reveal>s still animate
 * on their own viewport visibility. Use this specifically when you want
 * items to cascade together rather than pop in independently as each
 * crosses the viewport threshold.
 */
export function RevealGroup({
  children,
  className,
  staggerDelay = 0.08,
  once = true,
  amount = 0.15,
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * RevealItem
 * Pair with RevealGroup — a child that reads its animation state from the
 * parent's stagger context instead of tracking its own viewport visibility.
 */
export function RevealItem({ children, direction = "up", duration = 0.6, className, ...props }) {
  const offset = directionOffset[direction] ?? directionOffset.up

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, ...offset },
        show: {
          opacity: 1,
          x: 0,
          y: 0,
          transition: { duration, ease: [0.16, 1, 0.3, 1] },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}