"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, Frown } from "lucide-react"

export default function NotFound() {
  return (
    <section className="section">
      <div className="container-width flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="rounded-full bg-slate-100 dark:bg-slate-800 p-6"
        >
          <Frown className="h-12 w-12 text-slate-500 dark:text-slate-400" />
        </motion.div>

        <h1 className="mt-6 text-5xl font-extrabold text-slate-900 dark:text-slate-100">
          404
        </h1>
        <p className="mt-3 text-center text-slate-600 dark:text-slate-400">
          Oops. This page doesn&apos;t exist. Maybe it was crafted away.
        </p>

        <motion.div whileHover={{ scale: 1.03 }} className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
