"use client";

import { useEffect, useState } from "react";

type RefreshVariant = "ring" | "dots" | "wave";

export default function RefreshIndicator({
  label = "Refreshing",
  variant = "ring",
}: {
  label?: string;
  variant?: RefreshVariant;
}) {
  const [visible, setVisible] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    // Only animate on an actual browser refresh (F5 / reload), not on
    // first visit or client-side navigation. The root layout's
    // beforeInteractive script adds `ri-refreshing` to <html> before
    // paint on reload — use that as the source of truth (it also drives
    // the sidebar/nav animation suppression), with this check as fallback.
    let isReload =
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("ri-refreshing");
    if (!isReload) {
      try {
        const nav = performance
          .getEntriesByType?.("navigation")?.[0] as
          | PerformanceNavigationTiming
          | undefined;
        if (nav?.type) isReload = nav.type === "reload";
      } catch {
        // ignore — fall back to showing
      }
    }
    if (!isReload) {
      const t0 = setTimeout(() => setGone(true), 0);
      return () => clearTimeout(t0);
    }

    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setVisible(false), 1150);
    const t3 = setTimeout(() => setGone(true), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (gone) return null;

  return (
    <>
      <style>{`
        @keyframes ri-spin { to { transform: rotate(360deg); } }
        @keyframes ri-bounce { 0%, 100% { transform: translateY(0); opacity: .45; } 50% { transform: translateY(-7px); opacity: 1; } }
        @keyframes ri-wave { 0%, 100% { transform: scale(.7); opacity: .4; } 50% { transform: scale(1.15); opacity: 1; } }
        @keyframes ri-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
      `}</style>

      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "grid",
          placeItems: "center",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible
              ? "translateY(0) scale(1)"
              : "translateY(16px) scale(0.96)",
            transition:
              "opacity 0.3s ease, transform 0.34s cubic-bezier(0.16, 1, 0.3, 1)",
            background: "var(--glass-bg-strong, rgba(255,255,255,0.95))",
            border: "1px solid var(--glass-border, rgba(0,0,0,0.1))",
            borderRadius: "var(--radius-2xl, 22px)",
            boxShadow:
              "0 26px 64px -20px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.75)",
            backdropFilter: "blur(18px) saturate(150%)",
            WebkitBackdropFilter: "blur(18px) saturate(150%)",
            padding: "26px 36px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
            minWidth: 210,
          }}
        >
          {variant === "ring" && (
            <div style={{ position: "relative", width: 46, height: 46 }}>
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "3px solid var(--accent-soft, rgba(0,0,0,0.08))",
                  borderTopColor: "var(--accent)",
                  boxShadow: "0 0 18px -4px var(--accent-glow, transparent)",
                  animation: "ri-spin 0.8s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 9,
                  borderRadius: "50%",
                  background: "var(--accent-soft, rgba(0,0,0,0.08))",
                }}
              />
            </div>
          )}

          {variant === "dots" && (
            <div
              style={{
                display: "flex",
                gap: 8,
                height: 22,
                alignItems: "flex-end",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 10px -2px var(--accent-glow, transparent)",
                    animation: `ri-bounce 1s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          {variant === "wave" && (
            <div style={{ display: "flex", gap: 6, height: 22, alignItems: "center" }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 10px -2px var(--accent-glow, transparent)",
                    animation: `ri-wave 1.1s ease-in-out ${i * 0.12}s infinite`,
                  }}
                />
              ))}
            </div>
          )}

          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-display, inherit)",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              {label}
            </div>
            <div
              style={{
                fontSize: 12,
                color: "var(--text-tertiary)",
                marginTop: 4,
              }}
            >
              Just a moment…
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: 4,
              borderRadius: 99,
              overflow: "hidden",
              background: "var(--accent-soft, rgba(0,0,0,0.08))",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                background:
                  "linear-gradient(90deg, transparent, var(--accent), transparent)",
                backgroundSize: "200% 100%",
                animation: "ri-shimmer 1.1s linear infinite",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}