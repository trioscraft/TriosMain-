import Link from "next/link"
import ReviewForm from "@/components/review-form"
import ReviewList from "@/components/review-list"
import { Reveal } from "@/components/ui/reveal"
import { ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Reviews — Trios Craft",
  description:
    "See what our clients say about our work. Have a project with us? Share your review.",
}

export default function ReviewsPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="ed-hero ed-hero-reviews">
        <div className="ed-container">
          <Reveal>
            <span className="ed-kicker">Testimonials</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="ed-hero-title">
              Hear from our
              <br />
              <em>clients.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="ed-hero-sub">
              Real feedback from teams we&apos;ve helped build and ship great
              products.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="ed-hero-cta">
              <Link href="#write-review" className="ed-btn ed-btn-solid">
                Share a review <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="ed-btn ed-btn-line">
                Work with us
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="ed-hero-rule" />
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="ed-section">
        <div className="ed-container">
          <Reveal>
            <div className="ed-section-head">
              <span className="ed-index">01</span>
              <h2 className="ed-h2">What people say</h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <ReviewList />
          </Reveal>
        </div>
      </section>

      {/* ---------- Write a review ---------- */}
      <section id="write-review" className="ed-section ed-section-alt scroll-mt-20">
        <div className="ed-container">
          <Reveal>
            <div className="ed-section-head">
              <span className="ed-index">02</span>
              <h2 className="ed-h2">Share your review</h2>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="ed-form-card mx-auto max-w-2xl">
              <p className="ed-empty mb-6">
                Worked with us? Tell the world how it went.
              </p>
              <ReviewForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}