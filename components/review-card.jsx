"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import Image from "next/image"

export default function ReviewCard({ review }) {
  const { name, company, rating, comment, reply, createdAt } = review
  const date = createdAt
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "UTC",
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }).format(new Date(createdAt))
    : null

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="luxe-card h-full flex flex-col"
    >
      <div className="mb-4 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={
              i < rating
                ? "h-4 w-4 fill-amber-400 text-amber-400"
                : "h-4 w-4 fill-slate-200 text-slate-300 dark:fill-slate-700"
            }
          />
        ))}
        <span className="ml-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          {rating}/5
        </span>
      </div>

      <p className="mb-4 flex-grow text-slate-700 dark:text-slate-300">
        &ldquo;{comment}&rdquo;
      </p>

      {reply ? (
        <div className="mb-4 rounded-xl border border-luxe-200/60 bg-gradient-to-br from-primary-500/10 to-luxe-400/10 px-4 py-3 dark:border-white/10">
          <p className="mb-1 text-xs font-semibold text-primary-700 dark:text-luxe-300">
            Trios Craft
          </p>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {reply}
          </p>
        </div>
      ) : null}

      <div className="mt-auto flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500/20 to-luxe-400/20 text-slate-700 ring-1 ring-inset ring-white/10 dark:text-luxe-200"
        >
          {name?.charAt(0)?.toUpperCase() || "?"}
        </motion.div>
        <div className="text-sm">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{name}</p>
          {company && (
            <p className="text-slate-500 dark:text-slate-400">{company}</p>
          )}
          {date && (
            <time className="text-xs text-slate-400 dark:text-slate-500">
              {date}
            </time>
          )}
        </div>
      </div>
    </motion.div>
  )
}
