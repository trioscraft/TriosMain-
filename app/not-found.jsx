export const dynamic = "force-dynamic"

import Link from "next/link"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <section className="section mesh-aura">
      <div className="container-width flex flex-col items-center justify-center animate-fade-in">
        <div className="text-fade mb-6 animate-float">
          <svg className="h-20 w-20 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h1 className="text-5xl font-extrabold text-slate-900 dark:text-slate-100 animate-slide-up">
          404
        </h1>
        <p className="mt-3 text-center text-slate-600 dark:text-slate-400 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Oops. This page doesn&apos;t exist. Maybe it was crafted away.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 hover:scale-105 hover:-translate-x-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 animate-slide-up"
          style={{ animationDelay: '0.2s' }}
        >
          <Home className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </section>
  )
}