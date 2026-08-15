"use client"

import { useState } from "react"
import { Send, CheckCircle, XCircle } from "lucide-react"
import Button from "@/components/ui/button"
import { FormField, inputVariants } from "@/components/ui/form-field"

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setResult(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong")
      }
      setResult({ ok: true, message: data.message })
      setForm({ name: "", email: "", subject: "", message: "" })
    } catch (err) {
      setResult({ ok: false, message: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-5">
      {result && (
        <div
          className={`flex items-start gap-3 rounded-lg p-3 text-sm ${
            result.ok
              ? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-300"
              : "bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300"
          }`}
          role="alert"
        >
          {result.ok ? (
            <CheckCircle className="mt-0.5 h-5 w-5 flex-none" />
          ) : (
            <XCircle className="mt-0.5 h-5 w-5 flex-none" />
          )}
          <span>{result.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormField label="Name" htmlFor="name" required>
          <input
            id="name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Doe"
            className={inputVariants}
          />
        </FormField>
        <FormField label="Email" htmlFor="email" required>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="jane@example.com"
            className={inputVariants}
          />
        </FormField>
      </div>

      <FormField label="Subject" htmlFor="subject" required={false}>
        <input
          id="subject"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Project inquiry"
          className={inputVariants}
        />
      </FormField>

      <FormField label="Message" htmlFor="message" required>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          placeholder="Tell us about your project..."
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
            <span>Send message</span>
          </span>
        )}
      </Button>
    </form>
  )
}
