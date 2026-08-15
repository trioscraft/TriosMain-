"use client"

import { useState } from "react"
import { Send, CheckCircle, XCircle } from "lucide-react"

export function useSubmitReview() {
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  const submit = async (payload) => {
    setSubmitting(true)
    setStatus(null)
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Submission failed")
      setStatus({
        ok: true,
        message:
          "Thank you! Your review was submitted and is now live on the site.",
      })
      return { ok: true, review: data.review }
    } catch (err) {
      setStatus({ ok: false, message: err.message })
      return { ok: false, error: err.message }
    } finally {
      setSubmitting(false)
    }
  }

  return { submit, submitting, status }
}
