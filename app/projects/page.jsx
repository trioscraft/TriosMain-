import { projects } from "@/lib/data"
import Hero from "@/components/hero"
import ProjectCard from "@/components/project-card"

export const metadata = {
  title: "Projects — Trios Craft",
  description:
    "A showcase of the web apps, mobile apps, and software we've built for clients.",
}

const staggerBase = 0.05

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
          <div
            className="flex flex-col items-center justify-between gap-4 sm:flex-row animate-fade-in"
            style={{ animationDelay: "0.05s" }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Projects
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <div
                key={project.id}
                className="animate-slide-up"
                style={{ animationDelay: `${staggerBase * i}s` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
