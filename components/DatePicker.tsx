"use client";

import { useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthLabel(d: Date) {
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export default function DatePicker({
  value,
  onChange,
  min,
  placeholder = "Select a date",
}: {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<Date>(() => (value ? new Date(value) : new Date()));
  const anchorRef = useRef<HTMLDivElement>(null);

  function openPicker() {
    setView(value ? new Date(value) : new Date());
    setOpen(true);
  }

  function selectDate(day: Date) {
    const iso = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(
      day.getDate()
    ).padStart(2, "0")}`;
    onChange(iso);
    setOpen(false);
  }

  function prevMonth() {
    setView((v) => new Date(v.getFullYear(), v.getMonth() - 1, 1));
  }
  function nextMonth() {
    setView((v) => new Date(v.getFullYear(), v.getMonth() + 1, 1));
  }

  const selected = value ? new Date(value) : null;
  const minDate = min ? new Date(min) : null;

  const year = view.getFullYear();
  const month = view.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div ref={anchorRef} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={openPicker}
        className="input"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          cursor: "pointer",
          textAlign: "left",
          color: value ? "var(--text-primary)" : "var(--text-tertiary)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CalendarDays size={15} style={{ color: "var(--text-tertiary)" }} />
          {value || placeholder}
        </span>
        <ChevronRight size={14} style={{ color: "var(--text-tertiary)", transform: "rotate(90deg)" }} />
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
            }}
          />
          <div
            className="glass glass-strong"
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              zIndex: 50,
              width: 290,
              padding: 16,
              borderRadius: "var(--radius-lg)",
              boxShadow: "0 24px 60px -16px rgba(70,55,40,0.4)",
              animation: "scaleIn 0.2s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <button
                type="button"
                onClick={prevMonth}
                aria-label="Previous month"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--glass-border)",
                  background: "var(--bg-card)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <ChevronLeft size={15} />
              </button>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 14 }}>
                {monthLabel(view)}
              </div>
              <button
                type="button"
                onClick={nextMonth}
                aria-label="Next month"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--glass-border)",
                  background: "var(--bg-card)",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <ChevronRight size={15} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
              {weekdays.map((w) => (
                <div
                  key={w}
                  style={{
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 600,
                    color: "var(--text-tertiary)",
                    textTransform: "uppercase",
                    padding: "4px 0",
                  }}
                >
                  {w}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />;

                const isSelected = selected ? isSameDay(day, selected) : false;
                const isToday = isSameDay(day, today);
                const disabled = minDate ? day < minDate : false;

                return (
                  <button
                    key={`day-${i}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDate(day)}
                    style={{
                      width: 34,
                      height: 34,
                      margin: "0 auto",
                      borderRadius: "50%",
                      border: "none",
                      cursor: disabled ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.3 : 1,
                      fontFamily: "var(--font-mono)",
                      fontSize: 12.5,
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected
                        ? "#fff7ee"
                        : isToday
                        ? "var(--accent)"
                        : "var(--text-primary)",
                      background: isSelected
                        ? "linear-gradient(135deg, var(--accent-bright), var(--accent))"
                        : isToday
                        ? "var(--accent-soft)"
                        : "transparent",
                      boxShadow: isSelected ? "0 4px 14px -4px var(--accent-glow)" : "none",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && !disabled) {
                        e.currentTarget.style.background = "var(--accent-soft)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && !disabled) {
                        e.currentTarget.style.background = isToday ? "var(--accent-soft)" : "transparent";
                      }
                    }}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--glass-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-tertiary)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                Clear
              </button>
              <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                {selected ? selected.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "No date set"}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}