// Animated divider used between major sections — a glowing node with a
// pulsing ring centered on a hairline gradient rule (pure CSS, decorative).
export default function SectionDivider({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center py-2 ${className}`}
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <span className="absolute flex h-3 w-3 items-center justify-center">
        <span className="absolute h-3 w-3 rounded-full bg-luxe-400/40 animate-pulse-ring" />
        <span className="h-1.5 w-1.5 rounded-full bg-luxe-300 shadow-glow-luxe" />
      </span>
    </div>
  )
}
