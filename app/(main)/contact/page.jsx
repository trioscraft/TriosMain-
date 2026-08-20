import Link from "next/link"
import ContactForm from "@/components/contact-form"
import { Reveal } from "@/components/ui/reveal"
import { Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Contact — Trios Craft",
  description:
    "Get in touch with Trios Craft to discuss your next web app, mobile app, or software project.",
}

const contactInfo = [
  { icon: Mail, title: "Email", detail: "hello@trioscraft.com", href: "mailto:hello@trioscraft.com" },
  { icon: Phone, title: "Phone", detail: "+1 (555) 123-4567", href: "tel:+15551234567" },
  { icon: MapPin, title: "Location", detail: "San Francisco, CA", href: null },
  { icon: Clock, title: "Hours", detail: "Mon–Fri, 9AM–6PM (PT)", href: null },
]

export default function ContactPage() {
  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className="ed-hero ed-hero-contact">
        <div className="ed-container">
          <Reveal>
            <span className="ed-kicker">Contact</span>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="ed-hero-title">
              Let&apos;s talk.
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="ed-hero-sub">
              Have a project in mind or just want to say hello? Drop us a line.
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="ed-hero-cta">
              <a href="mailto:hello@trioscraft.com" className="ed-btn ed-btn-solid">
                Email us <ArrowRight size={16} />
              </a>
              <Link href="/reviews" className="ed-btn ed-btn-line">
                Read reviews
              </Link>
            </div>
          </Reveal>
        </div>
        <div className="ed-hero-rule" />
      </section>

      {/* ---------- Contact ---------- */}
      <section className="ed-section">
        <div className="ed-container">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div>
              <Reveal>
                <div className="ed-section-head">
                  <span className="ed-index">01</span>
                  <h2 className="ed-h2">Reach out</h2>
                </div>
              </Reveal>

              <Reveal delay={0.05}>
                <p className="ed-empty mb-8">
                  We&apos;d love to hear about your project. Fill in the form
                  and we&apos;ll get back within 24–48 hours.
                </p>
              </Reveal>

              <div>
                {contactInfo.map((info, i) => (
                  <Reveal key={info.title} delay={0.1 + i * 0.05}>
                    <div className="ed-contact-row">
                      <span className="ed-contact-icon">
                        <info.icon size={18} />
                      </span>
                      <div>
                        <p className="ed-contact-label">{info.title}</p>
                        {info.href ? (
                          <p className="ed-contact-value">
                            <a href={info.href}>{info.detail}</a>
                          </p>
                        ) : (
                          <p className="ed-contact-value">{info.detail}</p>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.2}>
                <div className="ed-map">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3135.387129898855!2d-122.45188188422606!3d37.78699057518318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1r8!3m3!1m2!1s0x80858064ab2bc13f%3A0xb40c21b3878c9937!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1!6m1!1sen"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Trios Craft location"
                  />
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="ed-form-card">
                <h2 className="ed-h2 mb-6">Send a message</h2>
                <ContactForm />
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}