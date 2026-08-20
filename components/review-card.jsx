"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

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
      className="neu-card neu-card-hover h-full flex flex-col p-6"
    >
      <div className="mb-4 flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={
              i < rating
                ? "h-4 w-4 fill-amber-400 text-amber-400"
                : "h-4 w-4 neu-text-muted opacity-50"
            }
          />
        ))}
        <span className="ml-2 text-sm font-medium neu-text-secondary">
          {rating}/5
        </span>
      </div>

      <p className="mb-4 flex-grow neu-text-secondary">
        &ldquo;{comment}&rdquo;
      </p>

      {reply ? (
        <div className="mb-4 rounded-2xl neu-pressed-sm px-4 py-3">
          <p className="mb-1 text-xs font-semibold neu-text-gold">
            Trios Craft
          </p>
          <p className="text-sm leading-relaxed neu-text-secondary">
            {reply}
          </p>
        </div>
      ) : null}

      <div className="mt-auto flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="neu-avatar h-10 w-10 text-sm font-semibold"
        >
          {name?.charAt(0)?.toUpperCase() || "?"}
        </motion.div>
        <div className="text-sm">
          <p className="font-semibold neu-text-primary">{name}</p>
          {company && (
            <p className="neu-text-secondary">{company}</p>
          )}
          {date && (
            <time className="text-xs neu-text-muted">
              {date}
            </time>
          )}
        </div>
      </div>
    </motion.div>
  )
}