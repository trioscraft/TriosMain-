// Editorial divider between major sections — a centered accent square on a
// hairline rule (pure CSS, decorative).
export default function SectionDivider({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center py-2 ${className}`}
    >
      <div className="h-px w-full bg-[var(--ed-line)]" />
      <span className="absolute h-2 w-2 rotate-45 bg-[var(--ed-accent)]" />
    </div>
  )
}