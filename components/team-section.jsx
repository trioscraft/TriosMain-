"use client"

import Image from "next/image"
import { useState } from "react"
import { motion } from "framer-motion"
import { Github, Linkedin, Twitter } from "lucide-react"
import { team } from "@/lib/data"

function MemberAvatar({ member }) {
  const [failed, setFailed] = useState(false)

  if (!member.image || failed) {
    return <span>{member.name.charAt(0)}</span>
  }

  return (
    <Image
      src={member.image}
      alt={member.name}
      width={400}
      height={300}
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  )
}

export default function TeamSection() {
  return (
    <div className="ed-team-grid">
      {team.map((member, i) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="ed-member"
        >
          <div className="ed-member-avatar">
            <MemberAvatar member={member} />
          </div>
          <h3>{member.name}</h3>
          <p className="ed-member-role">{member.role}</p>
          <p className="ed-member-bio">{member.bio}</p>
          {member.social && (
            <div className="ed-member-social">
              {member.social.github && (
                <a
                  href={member.social.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
              )}
              {member.social.linkedin && (
                <a
                  href={member.social.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {member.social.twitter && (
                <a
                  href={member.social.twitter}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}