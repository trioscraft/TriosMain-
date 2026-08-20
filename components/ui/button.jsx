"use client"

import clsx from "clsx"
import { cloneElement, isValidElement } from "react"
import { motion } from "framer-motion"

const MotionButton = motion.button

const base =
  "inline-flex items-center justify-center rounded-full font-medium focus:outline-none disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"

const variants = {
  primary: "neu-btn neu-btn-primary",
  secondary: "neu-btn neu-btn-primary",
  outline: "neu-btn",
  ghost: "neu-btn neu-btn-ghost",
}

const sizes = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
}

const hoverTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.97 },
  transition: { duration: 0.16, ease: [0.4, 0, 0.2, 1] },
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  asChild,
  ...props
}) {
  const classes = clsx(base, variants[variant], sizes[size], className)

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: clsx(classes, children.props.className),
    })
  }

  return <MotionButton className={classes} {...hoverTap} {...props} />
}