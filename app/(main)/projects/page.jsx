import { getPublishedPortfolioProjects } from "@/lib/portfolio"
import Hero from "@/components/hero"
import ProjectCard from "@/components/project-card"
import { Reveal } from "@/components/ui/reveal"

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
      <Hero
        title="Our work speaks"
        subtitle="A selection of products we've built for startups and businesses we believe in."
        primaryCTA={{ label: "Get in touch", href: "/contact" }}
        secondaryCTA={{ label: "Reviews", href: "/reviews" }}
      />

      <section className="section">
        <div className="container-width">
          <Reveal delay={0.05} className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <span className="eyebrow">Portfolio</span>
              <h2 className="heading-xl mt-4 text-fluid-2xl">Projects</h2>
            </div>
          </Reveal>

          {projects.length === 0 ? (
            <div className="mt-12 text-center">
              <p className="text-slate-600 dark:text-slate-400">
                New projects are on the way — check back soon!
              </p>
            </div>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, i) => (
                <Reveal key={project.id} delay={0.1 + i * 0.08}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
