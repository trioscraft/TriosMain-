import { getApprovedReviews } from "@/lib/reviews"
import ReviewCard from "@/components/review-card"
import { Reveal } from "@/components/ui/reveal"

export default async function ReviewList() {
  const reviews = await getApprovedReviews()

  if (!reviews || reviews.length === 0) {
    return (
      <p className="ed-empty text-center">
        No reviews yet. Be the first to share your experience!
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {reviews.map((review, i) => (
        <Reveal key={review.id} delay={0.1 + i * 0.08}>
          <ReviewCard review={review} />
        </Reveal>
      ))}
    </div>
  )
}