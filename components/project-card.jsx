"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Github, ExternalLink } from "lucide-react"

export default function ProjectCard({ project }) {
  const {
    title,
    tagline,
    description,
    image,
    category,
    tech,
    demo,
    github,
  } = project

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="luxe-card group flex flex-col overflow-hidden"
    >
      <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800/60 ring-1 ring-inset ring-white/10">
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
              className="object-cover object-center"
            />
          </motion.div>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            💼
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070c]/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-slate-800 backdrop-blur dark:bg-[#070a11]/80 dark:text-slate-200">
          {category}
        </span>
        <div className="scanline opacity-0 transition-opacity duration-500 group-hover:opacity-70" />
      </div>

      <h3 className="mb-1 font-display text-xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mb-2 text-sm font-medium text-luxe-600 dark:text-luxe-300">
        {tagline}
      </p>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300 flex-grow">
        {description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tech.map((t) => (
          <span
            key={t}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-white/5 dark:text-slate-300"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-3 pt-2">
        {demo && (
          <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={demo}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-900 dark:text-luxe-300"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Live Demo</span>
            </Link>
          </motion.div>
        )}
        {github && (
          <motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={github}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
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
