"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

export default function ServiceCard({ service }) {
  const [open, setOpen] = useState(false)
  const { title, description, icon, features } = service

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="luxe-card group h-full flex flex-col"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 text-3xl ring-1 ring-inset ring-white/10 transition-transform duration-500 ease-premium group-hover:scale-110 group-hover:rotate-6">
        {icon}
      </div>
      <h3 className="mb-2 font-display text-xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300 flex-grow">
        {description}
      </p>

      <AnimatePresence initial={false}>
        {open && features && (
          <motion.ul
            key="features"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm"
          >
            {features.map((f) => (
              <motion.li
                key={f}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 text-slate-700 dark:text-slate-300"
              >
                <span className="text-luxe-500 dark:text-luxe-300">✓</span>
                <span>{f}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="mt-auto flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900 dark:text-luxe-300"
      >
        <span>What&apos;s included</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
    </motion.div>
  )
}
