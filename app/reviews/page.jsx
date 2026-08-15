import Hero from "@/components/hero"
import ReviewForm from "@/components/review-form"
import ReviewList from "@/components/review-list"
import Reveal from "@/components/ui/reveal"
import { Star } from "lucide-react"

export const metadata = {
  title: "Reviews — Trios Craft",
  description:
    "See what our clients say about our work. Have a project with us? Share your review.",
}

export const dynamic = "force-dynamic"

export default function ReviewsPage() {
  return (
    <>
      <Hero
        title="Hear from our clients"
        subtitle="Real feedback from teams we've helped build and ship great products."
        primaryCTA={{ label: "Share a review", href: "#write-review" }}
        secondaryCTA={{ label: "Work with us", href: "/contact" }}
      />

      <section className="section">
        <div className="container-width">
          <Reveal delay={0.05} className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              What people say
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              We appreciate your feedback! Reviews appear on the site once
              submitted. Thank you for sharing your experience.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-12">
            <ReviewList />
          </Reveal>
        </div>
      </section>

      <section
        id="write-review"
        className="section bg-slate-50 dark:bg-slate-950 scroll-mt-20"
      >
        <div className="container-width">
          <Reveal delay={0.05} className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-500">
              <Star className="h-5 w-5 fill-amber-400 animate-pulse-slow" />
              Share your experience
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Share your review
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Worked with us? Tell the world how it went.
            </p>
          </Reveal>

          <Reveal
            delay={0.1}
            className="mt-10 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8"
          >
            <ReviewForm />
          </Reveal>
        </div>
      </section>
    </>
  )
}
