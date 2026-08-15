"use client"

import { useState, useEffect } from "react"
import RatingInput from "@/components/rating-input"
import { useSubmitReview } from "@/hooks/use-reviews"
import { Send, CheckCircle, XCircle } from "lucide-react"
import Button from "@/components/ui/button"
import { FormField, inputVariants } from "@/components/ui/form-field"

export default function ReviewForm() {
  const [name, setName] = useState("")
  const [company, setCompany] = useState("")
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const { submit, submitting, status } = useSubmitReview()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await submit({ name, company, rating, comment })
    if (res.ok) {
      setName("")
      setCompany("")
      setRating(5)
      setComment("")
    }
  }

  useEffect(() => {
    if (status?.ok) {
      const t = setTimeout(() => window.location.reload(), 1500)
      return () => clearTimeout(t)
    }
  }, [status])

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-y-5"
      aria-describedby={status ? "review-status" : undefined}
    >
      {status && (
        <div
          id="review-status"
          className="flex items-start gap-3 rounded-lg p-3 text-sm"
          role="alert"
        >
          {status.ok ? (
            <>
              <CheckCircle className="mt-0.5 h-5 w-5 flex-none text-green-500" />
              <span className="text-green-800 dark:text-green-300">
                {status.message}
              </span>
            </>
          ) : (
            <>
              <XCircle className="mt-0.5 h-5 w-5 flex-none text-red-500" />
              <span className="text-red-800 dark:text-red-300">
                {status.message}
              </span>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" required>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className={inputVariants}
          />
        </FormField>

        <FormField label="Company (optional)" htmlFor="company" required={false}>
          <input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc."
            className={inputVariants}
          />
        </FormField>
      </div>

      <RatingInput value={rating} onChange={setRating} label="How was your experience?" />

      <FormField label="Your review" htmlFor="comment" required>
        <textarea
          id="comment"
          required
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience working with Trios Craft..."
          className={inputVariants}
        />
      </FormField>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        disabled={submitting}
        className="w-max"
      >
        {submitting ? (
          <span className="flex items-center gap-2">
            <svg
              className="-ml-1 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Sending…</span>
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            <span>Submit Review</span>
          </span>
        )}
      </Button>
    </form>
  )
}
