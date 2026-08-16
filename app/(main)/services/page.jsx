import { services } from "@/lib/data"
import Hero from "@/components/hero"
import ServiceCard from "@/components/service-card"
import { Reveal } from "@/components/ui/reveal"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Services — Trios Craft",
  description:
    "Web applications, mobile apps, custom software, UI/UX design, and DevOps for clients who demand quality.",
}

export default function ServicesPage() {
  return (
    <>
      <Hero
        title="We build products"
        subtitle="End-to-end digital services — from concept and design to deployment and scaling."
        primaryCTA={{ label: "Talk to us", href: "/contact" }}
        secondaryCTA={{ label: "Our work", href: "/projects" }}
      />

      <section className="section">
        <div className="container-width">
          <Reveal delay={0.05} className="text-center">
            <span className="eyebrow">Capabilities</span>
            <h2 className="heading-xl mt-4 text-fluid-2xl">Everything we do</h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              We handle the full stack so you don&apos;t have to juggle multiple
              agencies.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={0.1 + i * 0.08}>
                <ServiceCard service={service} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
