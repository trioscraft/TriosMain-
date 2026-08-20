import Link from "next/link"
import { getApprovedReviews } from "@/lib/reviews"
import ReviewCarousel from "@/components/review-carousel"
import { Reveal } from "@/components/ui/reveal"
import { ArrowRight } from "lucide-react"

export default async function FeaturedReviews() {
  const reviews = await getApprovedReviews()

  if (reviews.length === 0) {
    return (
      <p className="ed-empty">
        No reviews yet. Be the first to share your experience!
      </p>
    )
  }

  return (
    <>
      <Reveal delay={0.1}>
        <div className="flex justify-center">
          <ReviewCarousel reviews={reviews} />
        </div>
      </Reveal>

      <Reveal delay={0.3}>
        <div className="mt-12">
          <Link href="/reviews" className="ed-view-all">
            See all reviews <ArrowRight size={16} />
          </Link>
        </div>
      </Reveal>
    </>
  )
}