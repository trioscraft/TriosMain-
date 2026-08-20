"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star } from "lucide-react"

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Average",
  4: "Good",
  5: "Excellent",
}

export default function RatingInput({ value = 5, onChange, label = "Your rating" }) {
  const [hover, setHover] = useState(0)

  return (
    <div className="flex flex-col gap-1.5">
      <label className="ed-field-label">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-1" role="radiogroup">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = (hover || value) >= star
          return (
            <motion.button
              key={star}
              type="button"
              aria-label={`${star} stars`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="p-0.5 outline-none"
            >
              <Star
                className={
                  filled
                    ? "h-5 w-5 fill-amber-400 text-amber-400"
                    : "h-5 w-5 fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600"
                }
              />
            </motion.button>
          )
        })}
      </div>
      <motion.span
        key={value}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs text-slate-500 dark:text-slate-400"
      >
        {ratingLabels[value] || ratingLabels[5]}
      </motion.span>
    </div>
  )
}
