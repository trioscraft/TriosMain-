import "./main.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import TechBackground from "@/components/tech-background"
import ScrollProgress from "@/components/scroll-progress"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="main-site">
      <TechBackground />
      <ScrollProgress />
      <Header />
      {children}
      <Footer />
    </div>
  )
}
