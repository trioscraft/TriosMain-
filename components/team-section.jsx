"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Github, Linkedin, Twitter } from "lucide-react"
import { team } from "@/lib/data"

export default function TeamSection() {
  return (
    <section className="section">
      <div className="container-width">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            The Trio Behind the Craft
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 dark:text-slate-400">
            We&apos;re three computer science graduates who met in college and
            decided to build the kind of software we&apos;d love to use ourselves.
            One codebase, one bug at a time.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
          {team.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="luxe-card flex flex-col text-center"
            >
              <div className="mx-auto mb-5 h-28 w-28 overflow-hidden rounded-full border-2 border-slate-200 dark:border-slate-700">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    width={112}
                    height={112}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl">
                    {member.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-white">
                {member.name}
              </h3>
              <p className="mb-3 text-sm text-luxe-600 dark:text-luxe-300">
                {member.role}
              </p>
              <p className="flex-grow text-sm text-slate-600 dark:text-slate-400">
                {member.bio}
              </p>
              {member.social && (
                <div className="mt-4 flex justify-center gap-3">
                  {member.social.github && (
                    <a
                      href={member.social.github}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-300"
                      aria-label="GitHub"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-300"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-600 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-300"
                      aria-label="Twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
