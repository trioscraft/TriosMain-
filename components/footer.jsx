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

const services = [
  "Web Applications",
  "Mobile Apps",
  "Software Development",
  "UI/UX Design",
  "DevOps & Cloud",
]

export default function Footer() {
  return (
    <footer className="ed-footer">
      <div className="ed-footer-inner">
        <div className="ed-footer-grid">
          <Reveal delay={0}>
            <div>
              <span className="ed-footer-brand">TRIOS CRAFT</span>
              <p className="ed-footer-about">
                Three CS graduates crafting digital experiences that are fast,
                beautiful, and built to last.
              </p>
              <div className="ed-footer-social">
                {social.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                  >
                    <s.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div>
              <h3 className="ed-footer-heading">Pages</h3>
              <ul className="ed-footer-list">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="ed-footer-link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div>
              <h3 className="ed-footer-heading">Services</h3>
              <ul className="ed-footer-list">
                {services.map((service) => (
                  <li key={service}>{service}</li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <div>
              <h3 className="ed-footer-heading">Say hello</h3>
              <ul className="ed-footer-list">
                <li>
                  <a href="mailto:hello@trioscraft.com" className="ed-footer-link">
                    hello@trioscraft.com
                  </a>
                </li>
                <li>
                  <a href="tel:+15551234567" className="ed-footer-link">
                    +1 (555) 123-4567
                  </a>
                </li>
                <li>San Francisco, CA</li>
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.4}>
          <div className="ed-footer-bottom">
            <p>
              &copy; {new Date().getFullYear()} Trios Craft. All rights reserved.
            </p>
            <p>Built with care by three engineers.</p>
          </div>
        </Reveal>
      </div>
    </footer>
  )
}