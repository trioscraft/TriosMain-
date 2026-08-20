import Link from "next/link"
import TeamSection from "@/components/team-section"
import TechMarquee from "@/components/tech-marquee"
import { Reveal } from "@/components/ui/reveal"
import { ArrowRight, Zap, Award, Heart } from "lucide-react"

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

const values = [
  { icon: Zap, title: "Speed", text: "MVPs in weeks, not months." },
  { icon: Award, title: "Quality", text: "Tested, reviewed, and ship-shape." },
  { icon: Heart, title: "Care", text: "We treat your product like our own." },
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
      {/* ---------- Hero ---------- */}
      <section className="ed-hero ed-hero-about">
        <div className="ed-container">
          <Reveal>
            <span className="ed-kicker">About</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="ed-hero-title">
              We&apos;re the trio
              <br />
              <em>solving it.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="ed-hero-sub">
              Three computer science graduates who believe great software comes
              from small teams that care deeply.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="ed-hero-cta">
              <Link href="/contact" className="ed-btn ed-btn-solid">
                Work with us <ArrowRight size={16} />
              </Link>
              <Link href="/projects" className="ed-btn ed-btn-line">
                See our work
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="ed-hero-rule" />
      </section>

      {/* ---------- Values ---------- */}
      <section className="ed-section">
        <div className="ed-container">
          <Reveal>
            <div className="ed-section-head">
              <span className="ed-index">01</span>
              <h2 className="ed-h2">How we work</h2>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="ed-empty max-w-2xl">
              We keep teams small so every decision matters. We move fast,
              measure impact, and care about the details that make products
              delightful. We partner with you — not just deliver to you.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-3">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={0.1 + i * 0.08}>
                <div className="ed-value">
                  <value.icon className="ed-value-icon" size={22} />
                  <h3 className="ed-h3">{value.title}</h3>
                  <p className="ed-value-text">{value.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Stack ---------- */}
      <section className="ed-section ed-section-alt">
        <div className="ed-container">
          <Reveal>
            <div className="ed-section-head">
              <span className="ed-index">02</span>
              <h2 className="ed-h2">Tools we love</h2>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="ed-empty mb-8">
              We pick the right tool for the job — not the shiniest one.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <TechMarquee items={aboutStack} />
          </Reveal>
        </div>
      </section>

      {/* ---------- Team ---------- */}
      <section className="ed-section">
        <div className="ed-container">
          <Reveal>
            <div className="ed-section-head">
              <span className="ed-index">03</span>
              <h2 className="ed-h2">The trio</h2>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <p className="ed-empty mb-8 max-w-2xl">
              Three computer science graduates who met in college and decided to
              build the kind of software we&apos;d love to use ourselves. One
              codebase, one bug at a time.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <TeamSection />
          </Reveal>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="ed-cta">
        <div className="ed-container">
          <Reveal>
            <h2 className="ed-cta-title">Like what you hear?</h2>
            <p className="ed-cta-sub">Let&apos;s build something together.</p>
            <Link href="/contact" className="ed-btn ed-btn-invert">
              Get in touch <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}