export const dynamic = "force-dynamic"

import Link from "next/link"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <section className="section relative overflow-hidden">
      <div aria-hidden="true" className="aurora-bg -z-10">
        <div className="aurora-blob left-1/4 top-1/3 h-72 w-72 bg-primary-500/25 animate-aurora" />
        <div className="aurora-blob right-1/4 top-1/4 h-72 w-72 bg-luxe-400/20 animate-aurora-slow" />
      </div>
      <div className="container-width flex flex-col items-center justify-center animate-fade-in">
        <div className="text-fade mb-6 animate-float">
          <svg className="h-20 w-20 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h1 className="font-display text-6xl font-extrabold text-slate-900 dark:text-white animate-slide-up">
          404
        </h1>
        <p className="mt-3 text-center text-slate-600 dark:text-slate-400 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Oops. This page doesn&apos;t exist. Maybe it was crafted away.
        </p>
        <Link
          href="/"
          className="btn-primary mt-8 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </section>
  )
}