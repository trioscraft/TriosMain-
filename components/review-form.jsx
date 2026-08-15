"use client"

import { useState, useEffect } from "react"
import RatingInput from "@/components/rating-input"
import { useSubmitReview } from "@/hooks/use-reviews"
import { Send, CheckCircle, XCircle } from "lucide-react"

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

  // After a successful submit, refresh so the new (server-rendered) review appears.
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
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div>
          <label
            htmlFor="company"
            className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Company (optional)
          </label>
          <input
            id="company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Inc."
            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      <RatingInput value={rating} onChange={setRating} label="How was your experience?" />

      <div>
        <label
          htmlFor="comment"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Your review <span className="text-red-500">*</span>
        </label>
        <textarea
          id="comment"
          required
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tell us about your experience working with Trios Craft..."
          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-max rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-60"
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
      </button>
    </form>
  )
}
