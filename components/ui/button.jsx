import clsx from "clsx"
import { cloneElement, isValidElement } from "react"

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  asChild,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-700",
    outline:
      "border border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-slate-800",
    ghost:
      "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
  }
  const sizes = {
    sm: "px-3.5 py-1.5 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  }

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      className: clsx(
        base,
        variants[variant],
        sizes[size],
        className,
        children.props.className
      ),
    })
  }

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    />
  )
}
