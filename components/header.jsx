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

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`ed-header ${scrolled ? "ed-header-scrolled" : ""}`}
    >
      <div className="ed-header-inner">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Link href="/" className="ed-logo">
            TRIOS CRAFT
          </Link>
        </motion.div>

        <nav className="ed-nav">
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
                  className={`ed-nav-link ${active ? "ed-nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              </motion.div>
            )
          })}
        </nav>

        <div className="ed-header-actions">
          <Link
            href="/admin/login"
            className="ed-btn ed-btn-line ed-btn-sm hidden md:inline-flex"
          >
            Login
          </Link>
          <ThemeToggle />
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMenuOpen(!menuOpen)}
              className="ed-burger"
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
                  className="block h-0.5 w-5 bg-current"
                  variants={{ open: { rotate: 45, y: 6 }, closed: { rotate: 0, y: 0 } }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-0.5 w-5 bg-current"
                  variants={{ open: { opacity: 0 }, closed: { opacity: 1 } }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block h-0.5 w-5 bg-current"
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
            className="ed-mobile-menu md:hidden"
          >
            <div className="ed-container flex flex-col gap-1 py-4">
              {navLinks.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`ed-nav-link ${active ? "ed-nav-link-active" : ""}`}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <Link
                href="/admin/login"
                onClick={() => setMenuOpen(false)}
                className="ed-btn ed-btn-solid mt-2 w-full"
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