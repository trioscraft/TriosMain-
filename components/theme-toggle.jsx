"use client"

import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import clsx from "clsx"

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const resolved = !mounted
    ? "light"
    : theme === "system"
      ? systemTheme ?? "light"
      : theme

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ]

  return (
    <div className="relative inline-flex h-9 w-[130px] items-center rounded-lg bg-slate-200/70 dark:bg-slate-700/70 p-1 text-xs font-medium">
      <div
        className="absolute inset-0 m-1 h-7 w-7 rounded-md bg-white dark:bg-slate-800 shadow transition-transform duration-200"
        style={{
          transform: `translateX(${
            resolved === "light"
              ? "0%"
              : resolved === "dark"
              ? "100%"
              : "200%"
          })`,
        }}
      />
      {options.map((opt) => {
        const Icon = opt.icon
        const active = resolved === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            aria-label={opt.label}
            onClick={() => setTheme(opt.value)}
            className={clsx(
              "relative z-10 flex-1 rounded-md py-1.5 text-center transition-colors",
              active
                ? "text-slate-900 dark:text-slate-100"
                : "text-slate-500 dark:text-slate-400"
            )}
          >
            <span className="sr-only">{opt.label}</span>
            <Icon className="mx-auto h-3.5 w-3.5" />
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
