"use client"

import { useRef } from "react"
import { motion } from "framer-motion"
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
      <p className="ed-empty text-center">
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
          <motion.div
            key={review.id}
            layout
            className="min-w-full shrink-0 snap-start sm:min-w-[calc(50%-1.5rem)] lg:min-w-[calc(33.333%-2rem)]"
            transition={{ layout: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }}
          >
            <ReviewCard review={review} />
          </motion.div>
        ))}
      </div>

      {reviews.length > 1 && (
        <>
          <motion.button
            type="button"
            onClick={() => scroll("prev")}
            whileHover={{ scale: 1.1, x: -2 }}
            whileTap={{ scale: 0.9 }}
            className="ed-carousel-btn -left-4"
            aria-label="Previous review"
          >
            <ChevronLeft className="h-5 w-5" />
          </motion.button>
          <motion.button
            type="button"
            onClick={() => scroll("next")}
            whileHover={{ scale: 1.1, x: 2 }}
            whileTap={{ scale: 0.9 }}
            className="ed-carousel-btn -right-4"
            aria-label="Next review"
          >
            <ChevronRight className="h-5 w-5" />
          </motion.button>
        </>
      )}
    </div>
  )
}