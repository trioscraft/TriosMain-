import Hero from "@/components/hero"
import TeamSection from "@/components/team-section"
import { Award, Heart, Zap } from "lucide-react"

export const metadata = {
  title: "About — Trios Craft",
  description:
    "We're three CS graduates who build digital products that matter. Learn our story.",
}

export default function AboutPage() {
  return (
    <>
      <Hero
        title="We're the trio solving"
        subtitle="We're three computer science graduates who believe great software comes from small teams that care deeply."
        primaryCTA={{ label: "Work with us", href: "/contact" }}
        secondaryCTA={{ label: "See our work", href: "/projects" }}
      />

      {/* Philosophy */}
      <section className="section">
        <div className="container-width">
          <div
            className="mx-auto max-w-3xl text-center animate-fade-in"
            style={{ animationDelay: "0.05s" }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              How we work
            </h2>
            <p className="mt-5 text-slate-600 dark:text-slate-400">
              We keep teams small so every decision matters. We move fast,
              measure impact, and care about the details that make products
              delightful. We partner with you — not just deliver to you.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="card text-center transition-transform hover:-translate-y-1">
                <Zap className="mx-auto mb-4 h-8 w-8 text-primary-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Speed
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  MVPs in weeks, not months.
                </p>
              </div>
              <div className="card text-center transition-transform hover:-translate-y-1">
                <Award className="mx-auto mb-4 h-8 w-8 text-primary-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Quality
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Tested, reviewed, and ship-shape.
                </p>
              </div>
              <div className="card text-center transition-transform hover:-translate-y-1">
                <Heart className="mx-auto mb-4 h-8 w-8 text-primary-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Care
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  We treat your product like our own.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="section bg-slate-50 dark:bg-slate-950">
        <div className="container-width">
          <div
            className="mx-auto max-w-4xl text-center animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tools we love
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              We pick the right tool for the job — not the shiniest one.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm text-slate-600 dark:text-slate-300">
              <span>Next.js</span>
              <span>React</span>
              <span className="text-slate-300">·</span>
              <span>React Native</span>
              <span>Flutter</span>
              <span className="text-slate-300">·</span>
              <span>Node.js</span>
              <span>TypeScript</span>
              <span className="text-slate-300">·</span>
              <span>Tailwind CSS</span>
              <span>AWS</span>
              <span className="text-slate-300">·</span>
              <span>Docker</span>
              <span>PostgreSQL</span>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <TeamSection />
    </>
  )
}
