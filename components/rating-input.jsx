"use client"

import { useState } from "react"
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
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="flex items-center gap-1" role="radiogroup">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            aria-label={`${star} stars`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5 outline-none"
          >
            <Star
              className={
                (hover || value) >= star
                  ? "h-5 w-5 fill-amber-400 text-amber-400"
                  : "h-5 w-5 fill-slate-200 text-slate-300 dark:fill-slate-700 dark:text-slate-600"
              }
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {ratingLabels[value] || ratingLabels[5]}
      </span>
    </div>
  )
}
