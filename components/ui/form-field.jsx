"use client"

export function FormField({ label, htmlFor, required, children, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium neu-text-secondary"
      >
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}

export const inputVariants = "neu-input"
export const textareaVariants = "neu-textarea resize-y"