"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Github, ExternalLink, Play } from "lucide-react"

export default function ProjectCard({ project }) {
  const {
    title,
    tagline,
    description,
    image,
    video_url,
    category,
    tech,
    demo_url,
    github_url,
    demo,
    github,
  } = project

  const demoHref = demo_url || demo
  const githubHref = github_url || github

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="neu-card neu-card-hover group flex flex-col overflow-hidden p-6"
    >
      <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl bg-[#d4d9e3] dark:bg-[#1b1e24] shadow-[inset_4px_4px_10px_var(--neu-shadow-dark),inset_-4px_-4px_10px_var(--neu-shadow-light)]">
        {image ? (
          <motion.div
            className="h-full w-full"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Image
              src={image}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center"
              unoptimized={!image.startsWith("/") && image.startsWith("http")}
            />
          </motion.div>
        ) : video_url ? (
          <div className="flex h-full w-full items-center justify-center bg-[#d4d9e3] dark:bg-[#1b1e24]">
            <span className="neu-chip flex items-center gap-2 text-sm font-medium">
              <Play className="h-5 w-5" /> Video project
            </span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            💼
          </div>
        )}
        <span className="neu-chip absolute top-3 right-3 px-2.5 py-0.5 text-xs font-medium">
          {category}
        </span>
      </div>

      <h3 className="mb-1 font-display text-xl font-semibold neu-text-primary">
        {title}
      </h3>
      <p className="mb-2 text-sm font-medium neu-text-gold">
        {tagline}
      </p>
      <p className="mb-4 text-sm neu-text-secondary flex-grow">
        {description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tech.map((t) => (
          <span
            key={t}
            className="neu-chip px-2.5 py-0.5 text-xs font-medium"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-4 pt-2">
        {demoHref && (
          <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={demoHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium neu-text-accent"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Live Demo</span>
            </Link>
          </motion.div>
        )}
        {githubHref && (
          <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={githubHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium neu-text-secondary hover:neu-text-primary"
            >
              <Github className="h-4 w-4" />
              <span>Source</span>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}