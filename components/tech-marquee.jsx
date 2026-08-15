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
            className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-luxe-400 shadow-glow-luxe" />
            {item}
          </span>
        ))}
      </div>
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#05070c] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#05070c] to-transparent" />
    </div>
  )
}
