import { getApprovedReviews } from "@/lib/reviews"
import ReviewCarousel from "@/components/review-carousel"
import { Star } from "lucide-react"

export default function FeaturedReviews() {
  const reviews = getApprovedReviews()

  return (
    <section className="section bg-slate-50 dark:bg-slate-950">
      <div className="container-width">
        <div
          className="mx-auto mb-4 flex max-w-3xl items-center justify-center gap-3 text-primary-600 animate-fade-in"
          style={{ animationDelay: "0.05s" }}
        >
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          <span className="text-sm font-semibold uppercase tracking-wider">
            Client Stories
          </span>
        </div>

        <h2
          className="mx-auto mb-4 max-w-3xl text-center text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          What our clients say
        </h2>

        <p
          className="mx-auto mb-12 max-w-2xl text-center text-slate-600 dark:text-slate-400 animate-fade-in"
          style={{ animationDelay: "0.15s" }}
        >
          Don&apos;t just take our word for it. Here&apos;s feedback straight
          from the teams we&apos;ve helped ship great products.
        </p>

        {reviews.length === 0 ? (
          <p className="text-center text-slate-600 dark:text-slate-400">
            No reviews yet. Be the first to share your experience!
          </p>
        ) : (
          <div className="mx-auto flex justify-center">
            <ReviewCarousel reviews={reviews} />
          </div>
        )}

        <div
          className="mt-12 text-center animate-fade-in"
          style={{ animationDelay: "0.3s" }}
        >
          <a
            href="/reviews"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900 dark:text-primary-300"
          >
            See all reviews <span>&rarr;</span>
          </a>
        </div>
      </div>
    </section>
  )
}
