import Link from "next/link"
import { Github, Linkedin, Twitter, Mail } from "lucide-react"
import { Reveal } from "@/components/ui/reveal"

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
]

const social = [
  { href: "https://github.com/trios-craft", label: "GitHub", icon: Github },
  { href: "https://linkedin.com", label: "LinkedIn", icon: Linkedin },
  { href: "https://twitter.com", label: "Twitter", icon: Twitter },
  { href: "mailto:hello@trioscraft.com", label: "Email", icon: Mail },
]

export default function Footer() {
  return (
    <footer className="relative mt-12 border-t border-white/10 bg-[#070a11]/60">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-luxe-400/50 to-transparent" />
      <div className="container-width section">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <Reveal delay={0}>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-display text-2xl font-extrabold tracking-tight text-fade">
                  TRIOS CRAFT
                </span>
              </div>
              <p className="max-w-xs text-sm text-slate-600 dark:text-slate-400">
                Three CS graduates crafting digital experiences that are fast,
                beautiful, and built to last.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {social.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:text-luxe-300 hover:bg-white/5 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-luxe-300"
                    aria-label={s.label}
                  >
                    <s.icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Pages
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-underline text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-luxe-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Services
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>Web Applications</li>
                <li>Mobile Apps</li>
                <li>Software Development</li>
                <li>UI/UX Design</li>
                <li>DevOps & Cloud</li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Say hello
              </h3>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li>hello@trioscraft.com</li>
                <li>+1 (555) 123-4567</li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.4} className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Trios Craft. All rights reserved.
          </p>
        </Reveal>
      </div>
    </footer>
  )
}
