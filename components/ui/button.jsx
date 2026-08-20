"use client"

import clsx from "clsx"
import { cloneElement, isValidElement } from "react"
import { motion } from "framer-motion"

const MotionButton = motion.button

const base =
  "inline-flex items-center justify-center font-medium focus:outline-none disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"

const variants = {
  primary: "ed-btn ed-btn-solid",
  secondary: "ed-btn ed-btn-solid",
  outline: "ed-btn ed-btn-line",
  ghost: "ed-btn ed-btn-line",
}

const sizes = {
  sm: "ed-btn-sm",
  md: "",
  lg: "ed-btn-lg",
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