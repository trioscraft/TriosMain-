import { services } from "@/lib/data"
import Hero from "@/components/hero"
import ServiceCard from "@/components/service-card"

export const metadata = {
  title: "Services — Trios Craft",
  description:
    "Web applications, mobile apps, custom software, UI/UX design, and DevOps for clients who demand quality.",
}

const staggerBase = 0.05

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
          <div
            className="text-center animate-fade-in"
            style={{ animationDelay: "0.05s" }}
          >
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything we do
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
              We handle the full stack so you don&apos;t have to juggle multiple
              agencies.
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
        </div>
      </section>
    </>
  )
}
