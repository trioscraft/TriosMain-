import Link from "next/link"
import { getPublishedPortfolioProjects } from "@/lib/portfolio"
import ProjectMediaSlider from "@/components/project-media-slider"
import { Reveal } from "@/components/ui/reveal"
import { ArrowRight, ExternalLink } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Projects — Trios Craft",
  description:
    "A showcase of the web apps, mobile apps, and software we've built for clients.",
}

export default async function ProjectsPage() {
  const projects = await getPublishedPortfolioProjects()

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="ed-hero ed-hero-projects">
        <div className="ed-container">
          <Reveal>
            <span className="ed-kicker">Portfolio</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="ed-hero-title">
              Our work speaks
              <br />
              <em>for itself.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="ed-hero-sub">
              A selection of products we&apos;ve built for startups and
              businesses we believe in.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="ed-hero-cta">
              <Link href="/contact" className="ed-btn ed-btn-solid">
                Get in touch <ArrowRight size={16} />
              </Link>
              <Link href="/reviews" className="ed-btn ed-btn-line">
                Read reviews
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="ed-hero-rule" />
      </section>

      {/* ---------- Projects ---------- */}
      <section className="ed-section">
        <div className="ed-container">
          <Reveal>
            <div className="ed-section-head">
              <span className="ed-index">01</span>
              <h2 className="ed-h2">Projects</h2>
            </div>
          </Reveal>

          {projects.length === 0 ? (
            <p className="ed-empty">New projects are on the way — check back soon!</p>
          ) : (
            <div className="ed-projects-grid">
              {projects.map((project, i) => (
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
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="ed-cta">
        <div className="ed-container">
          <Reveal>
            <h2 className="ed-cta-title">Want something built?</h2>
            <p className="ed-cta-sub">Let&apos;s turn your idea into a product.</p>
            <Link href="/contact" className="ed-btn ed-btn-invert">
              Start a project <ArrowRight size={16} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}