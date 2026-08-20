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
    <div className="neu-raised-sm relative inline-flex h-9 w-[130px] items-center rounded-full p-1 text-xs font-medium">
      <div
        className="absolute inset-0 m-1 h-7 w-7 rounded-full neu-text-accent transition-transform duration-200"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--neu-accent) 30%, transparent), color-mix(in srgb, var(--neu-accent-strong) 25%, transparent))",
          boxShadow:
            "inset 2px 2px 5px var(--neu-shadow-dark), inset -2px -2px 5px var(--neu-shadow-light)",
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
              "relative z-10 flex-1 rounded-full py-1.5 text-center transition-colors",
              active
                ? "neu-text-accent"
                : "neu-text-muted"
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