import { services, projects } from "@/lib/data"
import Hero from "@/components/hero"
import ServiceCard from "@/components/service-card"
import ProjectCard from "@/components/project-card"
import FeaturedReviews from "@/components/featured-reviews"
import { ArrowRight } from "lucide-react"

// Reviews are read from disk on each request so newly submitted reviews appear
// immediately on reload.
export const dynamic = "force-dynamic"

const staggerBase = 0.05

export default function HomePage() {
  const featuredProjects = projects.filter((p) => p.featured)

  return (
    <>
      <Hero
        title="We build digital"
        subtitle="Trios Craft is a trio of CS graduates who craft fast, beautiful web applications, mobile apps, and custom software for clients who demand quality."
        primaryCTA={{ label: "Start your project", href: "/contact" }}
        secondaryCTA={{ label: "See our work", href: "/projects" }}
      />

      {/* Stats */}
      <section className="section border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
        <div className="container-width">
          <div className="animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Crafted with care
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              We blend engineering rigor with design thinking to ship products
              that people actually love to use.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 justify-items-center gap-4 text-center sm:grid-cols-4">
            <Stat value="100+" label="Projects Delivered" delay={1} />
            <Stat value="50+" label="Happy Clients" delay={2} />
            <Stat value="3" label="Founders" delay={3} />
            <Stat value="99%" label="Uptime" delay={4} />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container-width">
          <div
            className="text-center animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              What we do
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Services
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              From concept to deployment, we handle the full stack so you can
              focus on what matters most.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <div
                key={service.id}
                className="animate-slide-up"
                style={{ animationDelay: `${staggerBase * i}s` }}
              >
                <ServiceCard service={service} />
              </div>
            ))}
          </div>

          <div
            className="mt-12 text-center animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <a
              href="/services"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900 dark:text-primary-300"
            >
              View all services <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="section bg-slate-50 dark:bg-slate-950">
        <div className="container-width">
          <div
            className="text-center animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-sm font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300">
              Our work
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Featured projects
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              A few of the products we&apos;ve built for amazing clients.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, i) => (
              <div
                key={project.id}
                className="animate-slide-up"
                style={{ animationDelay: `${staggerBase * i}s` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>

          <div
            className="mt-12 text-center animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <a
              href="/projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900 dark:text-primary-300"
            >
              View all projects <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Featured Reviews (server-rendered, reads fresh reviews per request) */}
      <FeaturedReviews />

      {/* CTA */}
      <section className="section">
        <div className="container-width">
          <div
            className="rounded-3xl gradient-bg py-14 text-center text-white animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="text-3xl font-extrabold sm:text-4xl">
              Ready to build something great?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg opacity-90">
              Let us chat about your next project.
            </p>
            <a
              href="/contact"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-primary-700 transition-transform hover:scale-105 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700"
            >
              Get in touch
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

function Stat({ value, label, delay }) {
  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="text-3xl font-extrabold text-primary-700 dark:text-primary-300">
        {value}
      </div>
      <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{label}</div>
    </div>
  )
}
