"use client"

import { useSyncExternalStore } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import clsx from "clsx"

const emptySubscribe = () => () => {}

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

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
    <div className="ed-theme-toggle">
      <div
        className="ed-theme-thumb"
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
              active ? "ed-theme-active" : ""
            )}
          >
            <span className="sr-only">{opt.label}</span>
            <Icon className="mx-auto h-3.5 w-3.5" />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}