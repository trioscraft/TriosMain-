import Link from "next/link"
import { services } from "@/lib/data"
import { getFeaturedPortfolioProjects, getPublicStats } from "@/lib/portfolio"
import FeaturedReviews from "@/components/featured-reviews"
import ProjectMediaSlider from "@/components/project-media-slider"
import { Reveal } from "@/components/ui/reveal"
import CountUp from "@/components/ui/count-up"
import { ArrowRight, ArrowUpRight, ExternalLink } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const featuredProjects = await getFeaturedPortfolioProjects()
  const stats = await getPublicStats()

  return (
    <div className="editorial-site">
      {/* ---------- Hero ---------- */}
      <section className="ed-hero ed-hero-home">
        <div className="ed-container">
          <Reveal>
            <span className="ed-kicker">Trios Craft — Digital Studio</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="ed-hero-title">
              We build digital
              <br />
              products that <em>matter.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="ed-hero-sub">
              Three CS graduates crafting fast, beautiful web apps, mobile apps,
              and custom software for clients who demand quality.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="ed-hero-cta">
              <Link href="/contact" className="ed-btn ed-btn-solid">
                Start your project <ArrowRight size={16} />
              </Link>
              <Link href="/projects" className="ed-btn ed-btn-line">
                See our work
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="ed-hero-rule" />
      </section>

      {/* ---------- Stats strip ---------- */}
      <section className="ed-stats">
        <div className="ed-container ed-stats-grid">
          <Stat number={stats.projects} suffix="+" label="Projects delivered" />
          <Stat number={stats.clients} suffix="+" label="Happy clients" />
          <Stat number={3} label="Founders" />
          <Stat number={99} suffix="%" label="Uptime" />
        </div>
      </section>

      {/* ---------- Services ---------- */}
      <section className="ed-section">
        <div className="ed-container">
          <Reveal>
            <div className="ed-section-head">
              <span className="ed-index">01</span>
              <h2 className="ed-h2">What we do</h2>
            </div>
          </Reveal>

          <div className="ed-services-list">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={i * 0.05}>
                <div className="ed-service-row">
                  <span className="ed-service-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="ed-service-icon">{service.icon}</div>
                  <div className="ed-service-body">
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                  </div>
                  <ArrowUpRight className="ed-service-arrow" size={20} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Featured projects ---------- */}
      <section className="ed-section ed-section-alt">
        <div className="ed-container">
          <Reveal>
            <div className="ed-section-head">
              <span className="ed-index">02</span>
              <h2 className="ed-h2">Selected work</h2>
            </div>
          </Reveal>

          {featuredProjects.length === 0 ? (
            <p className="ed-empty">Featured projects are on the way — check back soon.</p>
          ) : (
            <div className="ed-projects-grid">
              {featuredProjects.map((project, i) => (
                <Reveal key={project.id} delay={i * 0.08}>
                  <div className="ed-project-card">
                    <ProjectMediaSlider
                      images={[project.image, ...(project.gallery || [])].filter(Boolean)}
                      videos={project.videos || []}
                      title={project.title}
                    />
                    <div className="ed-project-info">
                      <h3>{project.title}</h3>
                      <p>{project.tagline}</p>
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noreferrer"
                          className="ed-project-link"
                        >
                          <ExternalLink size={13} /> Live demo
                        </a>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal delay={0.2}>
            <Link href="/projects" className="ed-view-all">
              View all projects <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="ed-section">
        <div className="ed-container">
          <Reveal>
            <div className="ed-section-head">
              <span className="ed-index">03</span>
              <h2 className="ed-h2">Client stories</h2>
            </div>
          </Reveal>
          <FeaturedReviews />
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="ed-cta">
        <div className="ed-container">
          <Reveal>
            <h2 className="ed-cta-title">Ready to build something great?</h2>
            <p className="ed-cta-sub">Let&apos;s talk about your next project.</p>
            <Link href="/contact" className="ed-btn ed-btn-invert">
              Get in touch <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  )
}

function Stat({ number, suffix = "", label }) {
  return (
    <div className="ed-stat">
      <div className="ed-stat-number">
        <CountUp value={number} suffix={suffix} duration={1.8} />
      </div>
      <div className="ed-stat-label">{label}</div>
    </div>
  )
}