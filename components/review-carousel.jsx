"use client"

import { useRef } from "react"
import ReviewCard from "@/components/review-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ReviewCarousel({ reviews }) {
  const containerRef = useRef(null)

  const scroll = (dir) => {
    const container = containerRef.current
    if (!container) return
    const scrollAmount = container.clientWidth
    container.scrollBy({
      left: dir === "next" ? scrollAmount : -scrollAmount,
      behavior: "smooth",
    })
  }

  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-center text-slate-600 dark:text-slate-400">
        No reviews yet. Be the first to share your experience!
      </p>
    )
  }

  return (
    <div className="relative w-full max-w-5xl">
      <div
        ref={containerRef}
        className="no-scrollbar flex gap-6 overflow-x-auto scroll-smooth scroll-p-4 snap-x"
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="min-w-full shrink-0 snap-start sm:min-w-[calc(50%-1.5rem)] lg:min-w-[calc(33.333%-2rem)]"
          >
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      {reviews.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scroll("prev")}
            className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-slate-800 p-2.5 text-slate-700 shadow-md hover:bg-slate-100 dark:text-slate-200"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scroll("next")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 rounded-full bg-white dark:bg-slate-800 p-2.5 text-slate-700 shadow-md hover:bg-slate-100 dark:text-slate-200"
            aria-label="Next review"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  )
}
