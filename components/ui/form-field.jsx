"use client"

export function FormField({ label, htmlFor, required, children, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="ed-field-label"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

export const inputVariants = "ed-input"
export const textareaVariants = "ed-textarea resize-y"