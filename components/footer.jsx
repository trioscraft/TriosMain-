import Link from "next/link"
import { Github, Linkedin, Twitter, Mail } from "lucide-react"

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
]

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      <div className="container-width section">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-fade">TRIOS CRAFT</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              Three CS graduates crafting digital experiences that are fast,
              beautiful, and built to last.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com/trios-craft"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
              >
                <Github size={20} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
              >
                <Twitter size={20} />
              </a>
              <a
                href="mailto:demo@trioscraft.com"
                className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Pages
            </h3>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

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
        </div>

        <div className="mt-10 border-t border-slate-200 dark:border-slate-800 pt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} Trios Craft. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
