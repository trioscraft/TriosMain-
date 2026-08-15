"use client"

import { useEffect, useState } from "react"

// Rotating "typewriter" that types and deletes through a list of words.
// Falls back to a static first word when the user prefers reduced motion.
export default function Typewriter({ words, className = "" }) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(words[0])
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduced) return

    let timeout
    const current = words[index % words.length]

    if (!deleting && text === current) {
      timeout = setTimeout(() => setDeleting(true), 1500)
    } else if (deleting && text === "") {
      timeout = setTimeout(() => {
        setDeleting(false)
        setIndex((i) => (i + 1) % words.length)
      }, 220)
    } else {
      timeout = setTimeout(
        () => {
          setText((t) =>
            deleting ? current.slice(0, t.length - 1) : current.slice(0, t.length + 1)
          )
        },
        deleting ? 45 : 90
      )
    }

    return () => clearTimeout(timeout)
  }, [text, deleting, index, words])

  return (
    <span className={className}>
      {text}
      <span className="caret animate-blink" />
    </span>
  )
}
