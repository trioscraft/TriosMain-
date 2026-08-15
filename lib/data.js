const team = [
  {
    id: 1,
    name: "Amit Verma",
    role: "Full-Stack Lead",
    bio: "Loves turning coffee into clean React & Node apps. Always exploring the latest in web performance and developer experience.",
    image: "/team/amit.jpg",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
  {
    id: 2,
    name: "Bhavya Sharma",
    role: "Design & Mobile Lead",
    bio: "Crafts experiences that feel effortless. Passionate about UI/UX, Flutter apps, and pixel-perfect interfaces.",
    image: "/team/bhavya.jpg",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
  {
    id: 3,
    name: "Chetna Rao",
    role: "Backend & DevOps Lead",
    bio: "Builds scalable backends, tames cloud infra, and automates everything. Believes in systems that just work.",
    image: "/team/chetna.jpg",
    social: {
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      twitter: "https://twitter.com",
    },
  },
]

const services = [
  {
    id: 1,
    title: "Web Applications",
    description:
      "Custom, responsive web applications built with modern frameworks like React, Next.js, and Vue. Fast, scalable, and SEO-friendly.",
    icon: "💻",
    features: ["Responsive Design", "SEO Optimized", "Real-time Data", "Performance Audits"],
  },
  {
    id: 2,
    title: "Software Development",
    description:
      "Desktop and cross-platform software solutions tailored to your workflow, from utilities to enterprise-grade tools.",
    icon: "⚙️",
    features: ["Cross-platform", "Custom Tooling", "Automation", "Maintenance"],
  },
  {
    id: 3,
    title: "Mobile Apps",
    description:
      "Beautiful, high-performance mobile apps for iOS and Android using React Native and Flutter with native feel.",
    icon: "📱",
    features: ["iOS & Android", "Offline Support", "Push Notifications", "App Store Deployment"],
  },
  {
    id: 4,
    title: "UI/UX Design",
    description:
      "User-centered design that delights and converts. From wireframes to polished prototypes and design systems.",
    icon: "🎨",
    features: ["Wireframing", "Prototyping", "Design Systems", "Usability Testing"],
  },
  {
    id: 5,
    title: "DevOps & Cloud",
    description:
      "CI/CD pipelines, cloud deployment, and infrastructure automation so your product scales effortlessly.",
    icon: "☁️",
    features: ["CI/CD Pipelines", "Cloud Deployment", "Monitoring", "Cost Optimization"],
  },
]

const projects = [
  {
    id: 1,
    title: "TaskFlow",
    tagline: "Collaborative task and project management",
    description:
      "A real-time collaborative workspace for teams to track tasks, sprints, and deliverables with live updates.",
    image: "/projects/taskflow.jpg",
    category: "Web App",
    tech: ["Next.js", "Socket.io", "MongoDB", "Tailwind"],
    demo: "https://taskflow.example.com",
    github: "https://github.com/trios-craft/taskflow",
    featured: true,
  },
  {
    id: 2,
    title: "CampusCart",
    tagline: "Campus marketplace for students",
    description:
      "A mobile-first marketplace letting students buy, sell, and rent items within their campus community.",
    image: "/projects/campuscart.jpg",
    category: "Mobile App",
    tech: ["Flutter", "Firebase", "Stripe"],
    demo: "https://campuscart.example.com",
    github: "https://github.com/trios-craft/campuscart",
    featured: true,
  },
  {
    id: 3,
    title: "ByteMetrics",
    tagline: "Developer productivity dashboard",
    description:
      "A desktop dashboard that aggregates dev-tool metrics (GitHub, CI, deployments) into one beautiful view.",
    image: "/projects/bytemetrics.jpg",
    category: "Software",
    tech: ["Electron", "React", "Node", "TypeScript"],
    demo: "https://bytemetrics.example.com",
    github: "https://github.com/trios-craft/bytemetrics",
    featured: true,
  },
  {
    id: 4,
    title: "QuickServe POS",
    tagline: "Restaurant point-of-sale system",
    description:
      "A fast, offline-capable POS system for restaurants with order management, billing, and analytics.",
    image: "/projects/quickserve.jpg",
    category: "Software",
    tech: ["React", "SQLite", "Express", "PWA"],
    demo: "https://quickserve.example.com",
    github: "https://github.com/trios-craft/quickserve",
    featured: false,
  },
  {
    id: 5,
    title: "FitTribe",
    tagline: "Social fitness companion app",
    description:
      "A social fitness app that connects users with workout buddies, tracks progress, and hosts challenges.",
    image: "/projects/fittribe.jpg",
    category: "Mobile App",
    tech: ["React Native", "GraphQL", "AWS Amplify"],
    demo: "https://fittribe.example.com",
    github: "https://github.com/trios-craft/fittribe",
    featured: false,
  },
]

module.exports = { team, services, projects }
