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

  const headerClass = scrolled
    ? "glass-surface"
    : "bg-transparent"

  const linkClass = (active) =>
    active
      ? "neu-text-accent font-semibold"
      : "neu-text-secondary hover:neu-text-accent"

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${headerClass}`}
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

        <nav className="hidden md:flex items-center gap-1.5">
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
                  className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    active
                      ? "neu-raised-sm !shadow-[inset_3px_3px_7px_var(--neu-shadow-dark),inset_-3px_-3px_7px_var(--neu-shadow-light)]"
                      : linkClass(active)
                  }`}
                >
                  {link.label}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/login"
            className="neu-btn hidden md:inline-flex"
          >
            Login
          </Link>
          <ThemeToggle />
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="neu-icon h-9 w-9"
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
                  className="block h-0.5 w-5 rounded bg-current"
                  variants={{ open: { rotate: 45, y: 6 }, closed: { rotate: 0, y: 0 } }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-0.5 w-5 rounded bg-current"
                  variants={{ open: { opacity: 0 }, closed: { opacity: 1 } }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-0.5 w-5 rounded bg-current"
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
            className="md:hidden glass-surface"
          >
            <div className="container-width flex flex-col gap-2 py-4">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition-all ${
                      active
                        ? "neu-pressed-sm"
                        : "neu-raised-sm"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <Link
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="neu-btn neu-btn-primary mt-1 w-full"
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