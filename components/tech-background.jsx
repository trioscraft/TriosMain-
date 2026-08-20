// Ambient, site-wide editorial backdrop: a faint grid that fades out at the
// edges plus soft drifting color glows. Purely decorative — fixed behind all
// content, non-interactive, and neutralized by prefers-reduced-motion.
export default function TechBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="ed-bg-grid" />
      <div className="ed-bg-blob ed-bg-blob-1" />
      <div className="ed-bg-blob ed-bg-blob-2" />
      <div className="ed-bg-blob ed-bg-blob-3" />
    </div>
  )
}