// Ambient, site-wide neumorphic backdrop: faint soft grid + gentle color
// blobs. Purely decorative — fixed behind all content, non-interactive,
// and neutralized by prefers-reduced-motion.
const particles = [
  { top: "12%", left: "8%", size: 4, anim: "animate-float", delay: "0s" },
  { top: "22%", left: "82%", size: 3, anim: "animate-float-delayed", delay: "1.2s" },
  { top: "68%", left: "14%", size: 5, anim: "animate-float", delay: "0.6s" },
  { top: "78%", left: "74%", size: 3, anim: "animate-float-delayed", delay: "2s" },
  { top: "38%", left: "48%", size: 2, anim: "animate-float", delay: "1.5s" },
  { top: "55%", left: "90%", size: 4, anim: "animate-float-delayed", delay: "0.3s" },
  { top: "8%", left: "55%", size: 3, anim: "animate-float", delay: "2.4s" },
  { top: "85%", left: "38%", size: 4, anim: "animate-float-delayed", delay: "0.9s" },
  { top: "30%", left: "28%", size: 2, anim: "animate-float", delay: "1.8s" },
  { top: "62%", left: "62%", size: 3, anim: "animate-float-delayed", delay: "1.1s" },
]

export default function TechBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="tech-grid absolute inset-0 opacity-40 dark:opacity-50" />
      {particles.map((p, i) => (
        <span
          key={i}
          className={`particle ${p.anim}`}
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
          }}
        />
      ))}
      <div className="aurora-bg">
        <div className="aurora-blob left-[5%] top-[10%] h-80 w-80 bg-primary-500/10 animate-aurora" />
        <div className="aurora-blob right-[8%] top-[20%] h-96 w-96 bg-secondary-500/10 animate-aurora-slow" />
        <div className="aurora-blob bottom-[5%] left-1/2 h-80 w-80 -translate-x-1/2 bg-luxe-400/10 animate-aurora" />
      </div>
    </div>
  )
}