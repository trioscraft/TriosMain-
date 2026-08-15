"use client"

import { useState, useEffect, useRef } from "react"
import { useInView } from "framer-motion"

export default function CountUp({
  value = 0,
  prefix = "",
  suffix = "",
  duration = 1.8,
  decimals = 0,
  className,
}) {
  const [current, setCurrent] = useState(value)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-120px" })

  useEffect(() => {
    if (!inView) return
    let start
    const from = 0
    const to = value
    const total = duration * 1000
    const step = (t) => {
      const elapsed = t - start
      const progress = Math.min(elapsed / total, 1)
      setCurrent(from + (to - from) * progress)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame((t) => {
      start = t
      step(t)
    })
  }, [inView, value, duration])

  const display = Number(current).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  )
}
