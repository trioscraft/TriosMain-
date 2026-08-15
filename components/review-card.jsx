"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"
import Image from "next/image"

export default function ReviewCard({ review }) {
  const { name, company, rating, comment, createdAt } = review
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
      whileHover={{
        y: -4,
        boxShadow: "0 20px 40px 0 rgb(15 23 42 / 0.1)",
      }}
      transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
      className="card h-full flex flex-col"
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

      <div className="mt-auto flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
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
