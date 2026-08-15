"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, Frown } from "lucide-react"

const MotionLink = motion.create(Link)

export default function NotFound() {
  return (
    <section className="section mesh-aura">
      <div className="container-width flex flex-col items-center justify-center">
        <motion.div
          initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
          animate={{ rotate: [0, -8, 8, 0], scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="text-fade"
        >
          <Frown className="h-20 w-20" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-center"
        >
          <h1 className="text-5xl font-extrabold text-slate-900 dark:text-slate-100">
            404
          </h1>
          <p className="mt-3 text-center text-slate-600 dark:text-slate-400">
            Oops. This page doesn&apos;t exist. Maybe it was crafted away.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-8"
        >
          <MotionLink
            href="/"
            whileHover={{ scale: 1.03, x: 2 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </MotionLink>
        </motion.div>
      </div>
    </section>
  )
}
