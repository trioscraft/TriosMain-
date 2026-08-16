export default function Loading() {
  return (
    <section className="section relative overflow-hidden">
      <div aria-hidden="true" className="tech-grid absolute inset-0 opacity-50" />
      <div className="container-width relative animate-fade-in space-y-6">
        <div className="h-8 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800/70 animate-shimmer bg-[length:200%_100%]" />
        <div className="h-5 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800/70 animate-shimmer bg-[length:200%_100%]" />
        <div className="h-5 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800/70 animate-shimmer bg-[length:200%_100%]" />
        <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800/70 animate-shimmer bg-[length:200%_100%]"
            />
          ))}
        </div>
        <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
          <span className="text-primary-500">$</span> initializing trios-craft
          <span className="caret animate-blink" />
        </p>
      </div>
    </section>
  )
}
