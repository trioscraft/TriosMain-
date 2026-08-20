"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const bgClass = scrolled
    ? "glass-surface shadow-soft-dark"
    : "bg-white/30 dark:bg-[#05070c]/30"

  const linkClass = (active) =>
    active
      ? "text-primary-700 dark:text-luxe-200"
      : "text-slate-700 hover:text-primary-600 dark:text-slate-300 dark:hover:text-white"

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800 transition-all duration-300 ${bgClass} backdrop-blur`}
    >
      <div className="container-width flex h-16 items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Link href="/" className="font-display text-xl font-extrabold tracking-tight text-fade">
            TRIOS CRAFT
          </Link>
        </motion.div>

        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link, i) => {
            const active = pathname === link.href
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i }}
              >
                <Link
                  href={link.href}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${linkClass(active)}`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-primary-500 via-secondary-400 to-luxe-400 transition-all ${
                      active ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg border border-primary-500/50 px-4 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-50 hover:border-primary-500 dark:text-luxe-200 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10 dark:hover:border-luxe-300/40 md:inline-flex"
          >
            Login
          </Link>
          <ThemeToggle />
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              <motion.span
                className="flex flex-col gap-1.5"
                animate={menuOpen ? "open" : "closed"}
                variants={{
                  open: { rotate: 180 },
                  closed: { rotate: 0 },
                }}
                transition={{ duration: 0.2 }}
              >
                <motion.span
                  className="block h-0.5 w-5 rounded bg-slate-700 dark:bg-slate-300"
                  variants={{ open: { rotate: 45, y: 6 }, closed: { rotate: 0, y: 0 } }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-0.5 w-5 rounded bg-slate-700 dark:bg-slate-300"
                  variants={{ open: { opacity: 0 }, closed: { opacity: 1 } }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-0.5 w-5 rounded bg-slate-700 dark:bg-slate-300"
                  variants={{ open: { rotate: -45, y: -6 }, closed: { rotate: 0, y: 0 } }}
                  transition={{ duration: 0.2 }}
                />
              </motion.span>
              <span className="sr-only">Toggle menu</span>
            </motion.button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="md:hidden border-t border-white/10 bg-white/60 dark:bg-[#05070c]/70 backdrop-blur-xl"
          >
            <div className="container-width flex flex-col gap-1 py-2">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${linkClass(active)}`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg bg-primary-600 px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-500"
              >
                Login
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
