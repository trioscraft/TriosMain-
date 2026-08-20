import { services } from "@/lib/data"
import { getFeaturedPortfolioProjects } from "@/lib/portfolio"
import Hero from "@/components/hero"
import ServiceCard from "@/components/service-card"
import ProjectCard from "@/components/project-card"
import FeaturedReviews from "@/components/featured-reviews"
import TechMarquee from "@/components/tech-marquee"
import SectionDivider from "@/components/section-divider"
import { Reveal } from "@/components/ui/reveal"
import CountUp from "@/components/ui/count-up"
import { ArrowRight } from "lucide-react"

const techStack = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Node.js",
  "Python",
  "AI / LLMs",
  "AWS",
  "Docker",
  "PostgreSQL",
  "Flutter",
  "GraphQL",
  "Redis",
  "Kubernetes",
]

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const featuredProjects = await getFeaturedPortfolioProjects()

  return (
    <>
      <Hero
        title="We build digital"
        subtitle="Trios Craft is a trio of CS graduates who craft fast, beautiful web applications, mobile apps, and custom software for clients who demand quality."
        primaryCTA={{ label: "Start your project", href: "/contact" }}
        secondaryCTA={{ label: "See our work", href: "/projects" }}
      />

      {/* Stats */}
      <section className="section">
        <div className="container-width">
          <Reveal delay={0.05} className="text-center">
            <span className="eyebrow">Why Trios Craft</span>
            <h2 className="heading-xl mt-4 text-fluid-2xl">Crafted with care</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              We blend engineering rigor with design thinking to ship products
              that people actually love to use.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-2 justify-items-center gap-4 text-center sm:grid-cols-4">
            <Stat number={100} suffix="+" label="Projects Delivered" delay={0} />
            <Stat number={50} suffix="+" label="Happy Clients" delay={0.1} />
            <Stat number={3} label="Founders" delay={0.2} />
            <Stat number={99} suffix="%" label="Uptime" delay={0.3} />
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Services */}
      <section className="section">
        <div className="container-width">
          <Reveal delay={0.05} className="text-center">
            <span className="eyebrow">What we do</span>
            <h2 className="heading-xl mt-4 text-fluid-2xl">Services</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              From concept to deployment, we handle the full stack so you can
              focus on what matters most.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={0.1 + i * 0.08}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3} className="mt-12 text-center">
            <a
              href="/services"
              className="link-underline inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900 dark:text-luxe-300"
            >
              View all services <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>

      <SectionDivider />

      {/* Featured Projects */}
      <section className="section">
        <div className="container-width">
          <Reveal delay={0.05} className="text-center">
            <span className="eyebrow">Our work</span>
            <h2 className="heading-xl mt-4 text-fluid-2xl">Featured projects</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              A few of the products we&apos;ve built for amazing clients.
            </p>
          </Reveal>

          {featuredProjects.length === 0 ? (
            <p className="mx-auto mt-12 max-w-xl text-center text-slate-600 dark:text-slate-400">
              Featured projects are on the way — explore what we&apos;re building soon.
            </p>
          ) : (
            <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {featuredProjects.map((project, i) => (
                <Reveal key={project.id} delay={0.1 + i * 0.08}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          )}

          <Reveal delay={0.3} className="mt-12 text-center">
            <a
              href="/projects"
              className="link-underline inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-900 dark:text-luxe-300"
            >
              View all projects <ArrowRight className="h-4 w-4" />
            </a>
          </Reveal>
        </div>
      </section>

      <SectionDivider />

      {/* Tech stack marquee */}
      <section className="section !py-12">
        <div className="container-width">
          <Reveal delay={0.05} className="mb-8 text-center">
            <span className="eyebrow">Our stack</span>
            <h2 className="heading-xl mt-4 text-fluid-xl">Powered by modern tech</h2>
          </Reveal>
          <TechMarquee items={techStack} />
        </div>
      </section>

      <SectionDivider />

      {/* Featured Reviews (server-rendered, reads fresh reviews per request) */}
      <FeaturedReviews />

      {/* CTA */}
      <section className="section">
        <div className="container-width">
          <Reveal delay={0.1} className="relative overflow-hidden rounded-3xl gradient-bg py-16 text-center text-white shadow-glow-luxe">
            <div aria-hidden="true" className="noise-overlay" />
            <div className="relative">
              <h2 className="font-display text-fluid-2xl font-extrabold">
                Ready to build something great?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/90">
                Let us chat about your next project.
              </p>
              <a
                href="/contact"
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lg transition-transform hover:scale-105 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700"
              >
                Get in touch
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

function Stat({ number, suffix = "", label, delay = 0 }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-extrabold text-primary-700 dark:text-luxe-300">
        <CountUp value={number} suffix={suffix} duration={1.8} />
      </div>
      <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">{label}</div>
    </div>
  )
}
