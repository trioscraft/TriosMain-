import { getApprovedReviews } from "@/lib/reviews"
import ReviewCard from "@/components/review-card"

export default function ReviewList() {
  const reviews = getApprovedReviews()

  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-center text-slate-600 dark:text-slate-400">
        No reviews yet. Be the first to share your experience!
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review, i) => (
        <div
          key={review.id}
          className="animate-slide-up"
          style={{ animationDelay: `${0.1 + i * 0.08}s` }}
        >
          <ReviewCard review={review} />
        </div>
      ))}
    </div>
  )
}
