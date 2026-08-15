export default function Loading() {
  return (
    <section className="section">
      <div className="container-width">
        <div className="space-y-6">
          <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-1/2 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-1/3 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
          <div className="grid grid-cols-1 gap-6 pt-6 sm:grid-cols-3">
            <div className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-48 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    </section>
  )
}
