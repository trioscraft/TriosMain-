"use client"

import Link from "next/link"
import Image from "next/image"
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
    <div className="group flex flex-col card-hover">
      <div className="relative mb-4 aspect-video overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            💼
          </div>
        )}
        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-slate-800 backdrop-blur dark:bg-slate-800/90 dark:text-slate-200">
          {category}
        </span>
      </div>

      <h3 className="mb-1 text-xl font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      <p className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
        {tagline}
      </p>
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400 flex-grow">
        {description}
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {tech.map((t) => (
          <span
            key={t}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            {t}
          </span>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-3 pt-2">
        {demo && (
          <Link
            href={demo}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:text-primary-900 dark:text-primary-300"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Live Demo</span>
          </Link>
        )}
        {github && (
          <Link
            href={github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
          >
            <Github className="h-4 w-4" />
            <span>Source</span>
          </Link>
        )}
      </div>
    </div>
  )
}
