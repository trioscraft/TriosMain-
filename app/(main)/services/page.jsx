import Link from "next/link"
import { services } from "@/lib/data"
import { Reveal } from "@/components/ui/reveal"
import { ArrowRight, ArrowUpRight } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Services — Trios Craft",
  description:
    "Web applications, mobile apps, custom software, UI/UX design, and DevOps for clients who demand quality.",
}

export default function ServicesPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="ed-hero ed-hero-services">
        <div className="ed-container">
          <Reveal>
            <span className="ed-kicker">Services</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="ed-hero-title">
              We build products
              <br />
              <em>end to end.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="ed-hero-sub">
              From concept and design to deployment and scaling — the full
              stack, so you don&apos;t have to juggle multiple agencies.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="ed-hero-cta">
              <Link href="/contact" className="ed-btn ed-btn-solid">
                Talk to us <ArrowRight size={16} />
              </Link>
              <Link href="/projects" className="ed-btn ed-btn-line">
                See our work
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="ed-hero-rule" />
      </section>

      {/* ---------- Services ---------- */}
      <section className="ed-section">
        <div className="ed-container">
          <Reveal>
            <div className="ed-section-head">
              <span className="ed-index">01</span>
              <h2 className="ed-h2">Everything we do</h2>
            </div>
          </Reveal>

          <div className="ed-services-list ed-services-list-with-thumbs">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={i * 0.05}>
                <div className="ed-service-row">
                  <span className="ed-service-num">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="ed-service-thumb"
                    loading="lazy"
                  />
                  <div className="ed-service-body">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <ul className="ed-service-features">
                      {service.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                  <ArrowUpRight className="ed-service-arrow" size={20} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="ed-cta">
        <div className="ed-container">
          <Reveal>
            <h2 className="ed-cta-title">Not sure what you need?</h2>
            <p className="ed-cta-sub">
              Tell us the problem — we&apos;ll recommend the right approach.
            </p>
            <Link href="/contact" className="ed-btn ed-btn-invert">
              Get in touch <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}