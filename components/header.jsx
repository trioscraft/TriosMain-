import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
]

export default function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur">
      <div className="container-width flex h-16 items-center justify-between">
        <Link href="/" className="text-xl font-bold text-fade">
          TRIOS CRAFT
        </Link>
        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-primary-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <MobileMenu navLinks={navLinks} />
        </div>
      </div>
    </header>
  )
}

function MobileMenu({ navLinks }) {
  return (
    <details className="group md:hidden">
      <summary className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </summary>
      <div className="absolute top-16 right-4 z-30 hidden max-h-[calc(100vh-4rem)] w-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl group-open:block">
        <div className="flex flex-col p-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-primary-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-primary-400"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </details>
  )
}
