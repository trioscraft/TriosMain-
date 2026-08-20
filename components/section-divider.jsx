// Neumorphic divider between major sections — a soft raised node centered
// on a hairline rule (pure CSS, decorative).
export default function SectionDivider({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center py-2 ${className}`}
    >
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--neu-text-3)] to-transparent opacity-50" />
      <span className="neu-icon absolute h-3.5 w-3.5 !rounded-full" />
    </div>
  )
}