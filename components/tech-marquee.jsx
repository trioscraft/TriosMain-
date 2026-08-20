// Infinite tech-stack marquee. The row is duplicated once so the
// -50% loop is seamless; hover pauses the scroll for readability.
export default function TechMarquee({ items, className = "" }) {
  const row = [...items, ...items]
  return (
    <div className={`marquee-paused relative overflow-hidden ${className}`}>
      <div className="marquee-track animate-marquee-slow items-center gap-4 py-2">
        {row.map((item, i) => (
          <span
            key={i}
            className="neu-chip inline-flex shrink-0 items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium"
          >
            <span className="h-1.5 w-1.5 rounded-full neu-text-gold shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)]" />
            {item}
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[var(--neu-bg)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[var(--neu-bg)] to-transparent" />
    </div>
  )
}