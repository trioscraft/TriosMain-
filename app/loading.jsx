export default function Loading() {
  return (
    <section className="section">
      <div className="container-width space-y-6">
        <div className="h-8 w-2/3 rounded-lg bg-slate-200 dark:bg-slate-800 shimmer" />
        <div className="h-5 w-1/2 rounded-lg bg-slate-200 dark:bg-slate-800 shimmer" />
        <div className="h-5 w-1/3 rounded-lg bg-slate-200 dark:bg-slate-800 shimmer" />
        <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 shimmer"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
