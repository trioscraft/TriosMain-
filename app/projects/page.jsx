import { projects } from "@/lib/data"
import Hero from "@/components/hero"
import ProjectCard from "@/components/project-card"
import Reveal from "@/components/ui/reveal"

export const metadata = {
  title: "Projects — Trios Craft",
  description:
    "A showcase of the web apps, mobile apps, and software we've built for clients.",
}

export default function ProjectsPage() {
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
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Projects
            </h2>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal key={project.id} delay={0.1 + i * 0.08}>
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
