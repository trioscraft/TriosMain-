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
            className="ed-marquee-chip"
          >
            <span className="ed-marquee-dot" />
            {item}
          </span>
        ))}
      </div>
      <div className="ed-marquee-fade ed-marquee-fade-left" />
      <div className="ed-marquee-fade ed-marquee-fade-right" />
    </div>
  )
}