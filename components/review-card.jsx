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
      className="ed-review-card"
    >
      <div className="ed-review-stars">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={
              i < rating
                ? "h-4 w-4 fill-amber-400 text-amber-400"
                : "h-4 w-4 ed-star-empty"
            }
          />
        ))}
        <span className="ed-review-rating">{rating}/5</span>
      </div>

      <p className="ed-review-quote">&ldquo;{comment}&rdquo;</p>

      {reply ? (
        <div className="ed-review-reply">
          <span className="ed-review-reply-label">Trios Craft</span>
          <p>{reply}</p>
        </div>
      ) : null}

      <div className="ed-review-author">
        <div className="ed-review-avatar">
          {name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="text-sm">
          <p className="ed-review-name">{name}</p>
          {company && <p className="ed-review-meta">{company}</p>}
          {date && <time className="ed-review-meta">{date}</time>}
        </div>
      </div>
    </motion.div>
  )
}