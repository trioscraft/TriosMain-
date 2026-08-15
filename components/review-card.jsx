"use client"

import { Star } from "lucide-react"
import Image from "next/image"

export default function ReviewCard({ review }) {
  const { name, company, rating, comment, createdAt } = review
  const date = createdAt ? new Date(createdAt).toLocaleDateString() : null

  return (
    <div className="card h-full flex flex-col">
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {name?.charAt(0)?.toUpperCase() || "?"}
        </div>
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
    </div>
  )
}
