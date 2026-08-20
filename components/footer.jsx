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
    <footer className="relative mt-12">
      <div className="container-width section">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <Reveal delay={0}>
            <div className="neu-card p-6 space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-display text-2xl font-extrabold tracking-tight text-fade">
                  TRIOS CRAFT
                </span>
              </div>
              <p className="max-w-xs text-sm neu-text-secondary">
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
                    className="neu-icon h-9 w-9 hover:neu-text-accent"
                    aria-label={s.label}
                  >
                    <s.icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="neu-card p-6 space-y-3">
              <h3 className="text-sm font-semibold neu-text-primary">
                Pages
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-underline text-sm neu-text-secondary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="neu-card p-6 space-y-3">
              <h3 className="text-sm font-semibold neu-text-primary">
                Services
              </h3>
              <ul className="space-y-2 text-sm neu-text-secondary">
                <li>Web Applications</li>
                <li>Mobile Apps</li>
                <li>Software Development</li>
                <li>UI/UX Design</li>
                <li>DevOps & Cloud</li>
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div className="neu-card p-6 space-y-3">
              <h3 className="text-sm font-semibold neu-text-primary">
                Say hello
              </h3>
              <ul className="space-y-2 text-sm neu-text-secondary">
                <li>hello@trioscraft.com</li>
                <li>+1 (555) 123-4567</li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.4} className="mt-10 text-center text-sm neu-text-muted">
          <p>
            &copy; {new Date().getFullYear()} Trios Craft. All rights reserved.
          </p>
        </Reveal>
      </div>
    </footer>
  )
}