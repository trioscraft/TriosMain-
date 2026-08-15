import Hero from "@/components/hero"
import TeamSection from "@/components/team-section"
import TechMarquee from "@/components/tech-marquee"
import { Reveal } from "@/components/ui/reveal"
import { Award, Heart, Zap } from "lucide-react"

const aboutStack = [
  "Next.js",
  "React",
  "React Native",
  "Flutter",
  "TypeScript",
  "Tailwind CSS",
  "AWS",
  "Docker",
  "PostgreSQL",
]

export const dynamic = "force-dynamic"

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
          <Reveal delay={0.05} className="mx-auto max-w-3xl text-center">
            <span className="eyebrow">Our approach</span>
            <h2 className="heading-xl mt-4 text-fluid-2xl">How we work</h2>
            <p className="mt-5 text-slate-600 dark:text-slate-400">
              We keep teams small so every decision matters. We move fast,
              measure impact, and care about the details that make products
              delightful. We partner with you — not just deliver to you.
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <Reveal delay={0.1}>
                <div className="luxe-card text-center">
                  <Zap className="mx-auto mb-4 h-8 w-8 text-primary-500" />
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white">
                    Speed
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    MVPs in weeks, not months.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.18}>
                <div className="luxe-card text-center">
                  <Award className="mx-auto mb-4 h-8 w-8 text-luxe-400" />
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white">
                    Quality
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    Tested, reviewed, and ship-shape.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.26}>
                <div className="luxe-card text-center">
                  <Heart className="mx-auto mb-4 h-8 w-8 text-secondary-400" />
                  <h3 className="font-display font-semibold text-slate-900 dark:text-white">
                    Care
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    We treat your product like our own.
                  </p>
                </div>
              </Reveal>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Tech stack */}
      <section className="section">
        <div className="container-width">
          <Reveal delay={0.05} className="mx-auto max-w-4xl text-center">
            <span className="eyebrow">Stack</span>
            <h2 className="heading-xl mt-4 text-fluid-2xl">Tools we love</h2>
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
              <span>TypeScript</span>
              <span className="text-slate-300">·</span>
              <span>Tailwind CSS</span>
              <span>AWS</span>
              <span className="text-slate-300">·</span>
              <span>Docker</span>
              <span>PostgreSQL</span>
            </div>
            <div className="mt-10">
              <TechMarquee items={aboutStack} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Team */}
      <TeamSection />
    </>
  )
}
