import Button from "@/components/ui/button"

export default function Hero({
  title,
  subtitle,
  primaryCTA = { label: "Get in touch", href: "/contact" },
  secondaryCTA = { label: "See our work", href: "/projects" },
}) {
  return (
    <section className="container-width section">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          <span className="block">{title}</span>
          <span className="block text-fade">Trios Craft</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
          {subtitle}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild variant="primary" size="lg">
            <a href={primaryCTA.href}>{primaryCTA.label}</a>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a href={secondaryCTA.href}>{secondaryCTA.label}</a>
          </Button>
        </div>
      </div>
    </section>
  )
}
