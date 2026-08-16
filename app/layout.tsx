import "./globals.css"
import type { ReactNode } from "react"
import { Inter, Sora } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-family",
  display: "swap",
})

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["600", "700", "800"],
})

export const metadata = {
  metadataBase: new URL("https://trioscraft.com"),
  title: "Trios Craft — A Trio of CS Graduates Building Digital Experiences",
  description:
    "Trios Craft builds beautiful, fast, and scalable web applications, mobile apps, and custom software for clients who demand quality.",
  keywords: [
    "web development",
    "mobile apps",
    "software development",
    "UI/UX design",
    "devops",
    "Next.js",
    "React",
    "Flutter",
    "portfolio",
  ],
  authors: [{ name: "Trios Craft" }],
  openGraph: {
    title: "Trios Craft — Web, Software & Mobile Applications",
    description:
      "Trios Craft builds beautiful, fast, and scalable web applications, mobile apps, and custom software for clients who demand quality.",
    url: "https://trioscraft.com",
    siteName: "Trios Craft",
    images: [{ url: "/og-image.png" }],
    locale: "en-US",
    type: "website",
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  manifest: "/manifest.json",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${sora.variable} bg-white text-slate-900 dark:bg-[#05070c] dark:text-slate-200 antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
