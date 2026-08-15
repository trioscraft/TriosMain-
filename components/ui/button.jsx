"use client"

import clsx from "clsx"
import { cloneElement, isValidElement } from "react"
import { motion } from "framer-motion"

const MotionButton = motion.button

const base =
  "inline-flex items-center justify-center rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none transition-shadow duration-200"

const variants = {
  primary:
    "bg-primary-600 text-white hover:bg-primary-700 shadow-soft hover:shadow-glow",
  secondary:
    "bg-secondary-500 text-white hover:bg-secondary-600 shadow-soft hover:shadow-glow-secondary",
  outline:
    "bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50/70 dark:hover:bg-slate-800",
  ghost:
    "bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
}

const sizes = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
}

const hoverTap = {
  whileHover: { scale: 1.03, y: -1 },
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