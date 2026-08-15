import Hero from "@/components/hero"
import ContactForm from "@/components/contact-form"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

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
      <Hero
        title="Let's talk"
        subtitle="Have a project in mind or just want to say hello? Drop us a line."
        primaryCTA={{ label: "Email us", href: "mailto:hello@trioscraft.com" }}
        secondaryCTA={{ label: "Reviews", href: "/reviews" }}
      />

      <section className="section">
        <div className="container-width">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div
              className="space-y-4 animate-fade-in"
              style={{ animationDelay: "0.05s" }}
            >
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Reach out
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                We&apos;d love to hear about your project. Fill in the form and
                we&apos;ll get back within 24-48 hours.
              </p>

              <div className="mt-8 space-y-4">
                {contactInfo.map((info) => (
                  <div
                    key={info.title}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 transition-transform hover:translate-x-1"
                  >
                    <info.icon className="h-5 w-5 text-primary-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {info.title}
                      </p>
                      {info.href ? (
                        <a
                          href={info.href}
                          className="text-slate-900 dark:text-slate-100 hover:text-primary-700 dark:hover:text-primary-300"
                        >
                          {info.detail}
                        </a>
                      ) : (
                        <p className="text-slate-900 dark:text-slate-100">
                          {info.detail}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 h-64 w-full animate-fade-in overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800"
                style={{ animationDelay: "0.1s" }}
              >
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
            </div>

            <div
              className="animate-fade-in rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm sm:p-8"
              style={{ animationDelay: "0.1s" }}
            >
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
                Send a message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
