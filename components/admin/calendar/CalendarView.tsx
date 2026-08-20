"use client";

import { useCallback, useMemo, useState } from "react";
import type { CalendarEvent } from "@/components/admin/calendar/CalendarPageClient";

type Priority = "low" | "medium" | "high" | "urgent";

type Profile = { id: string; name: string };
type Project = { id: string; name: string };

const PRIORITY_COLORS: Record<Priority, { bg: string; border: string; text: string; dot: string }> = {
  urgent: { bg: "#fee2e2", border: "#ef4444", text: "#dc2626", dot: "🔴" },
  high: { bg: "#fef3c7", border: "#f59e0b", text: "#d97706", dot: "🟠" },
  medium: { bg: "#dbeafe", border: "#3b82f6", text: "#2563eb", dot: "🔵" },
  low: { bg: "#f0fdf4", border: "#22c55e", text: "#16a34a", dot: "🟢" },
};

const PROJECT_COLORS = { bg: "#fdeeda", border: "#c25b2f", text: "#a1481f" };

const FESTIVAL_COLORS = { bg: "#fdf1dc", border: "#e8861e", text: "#b45309" };
const NATIONAL_COLORS = { bg: "#e7ecff", border: "#4f6ef2", text: "#3b4fd8" };

function colorsFor(ev: CalendarEvent) {
  if (ev.kind === "holiday") return ev.holiday_type === "national" ? NATIONAL_COLORS : FESTIVAL_COLORS;
  if (ev.kind === "project") return PROJECT_COLORS;
  return PRIORITY_COLORS[ev.priority] || PRIORITY_COLORS.low;
}

// Physical calendars put festivals first in each day cell.
function holidayFirst(a: CalendarEvent, b: CalendarEvent) {
  if (a.kind === "holiday" && b.kind !== "holiday") return -1;
  if (b.kind === "holiday" && a.kind !== "holiday") return 1;
  return 0;
}

const VIEW_LABELS = { month: "Month", week: "Week", day: "Day" } as const;
type ViewMode = keyof typeof VIEW_LABELS;

function isoToDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m || 1) - 1, d || 1);
}

function dateToISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfWeek(d: Date) {
  const dt = new Date(d);
  const day = dt.getDay();
  dt.setDate(dt.getDate() - day);
  return dt;
}

function addDays(d: Date, n: number) {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt;
}

function formatDisplay(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface Props {
  view: ViewMode;
  onChangeView: (v: ViewMode) => void;
  anchorDate: string;
  onChangeAnchorDate: (d: Date) => void;
  events: CalendarEvent[];
  loading: boolean;
  projects: Project[];
  assignees: Profile[];
  projectFilter: string;
  assigneeFilter: string;
  priorityFilter: string;
  search: string;
  onChangeProjectFilter: (v: string) => void;
  onChangeAssigneeFilter: (v: string) => void;
  onChangePriorityFilter: (v: string) => void;
  onChangeSearch: (v: string) => void;
  onTaskClick?: (taskId: string) => void;
  onTaskDueDateChange: (taskId: string, newISODate: string) => void;
}

// ── Month View ──────────────────────────────────────────────────────────────
function MonthGrid({
  anchor,
  events,
  onDragStart,
  onTaskDrop,
  onCellClick,
  onTaskClick,
}: {
  anchor: Date;
  events: CalendarEvent[];
  onDragStart: (ev: { id: string; due_date?: string }, e: React.DragEvent) => void;
  onTaskDrop?: (taskId: string, newDateISO: string) => void;
  onCellClick: (dateISO: string) => void;
  onTaskClick?: (id: string) => void;
}) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const cells: Date[] = [];
  for (let i = 0; i < startPad; i++) cells.push(addDays(firstDay, -startPad + i));
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(addDays(cells[cells.length - 1], 1));

  const today = new Date();

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
      const existing = map.get(ev.due_date) || [];
      existing.push(ev);
      map.set(ev.due_date, existing);
    });
    return map;
  }, [events]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", background: "var(--border)" }}>
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
        <div
          key={d}
          style={{
            padding: "8px 6px",
            background: "var(--bg-card)",
            textAlign: "center",
            fontSize: "11px",
            fontWeight: 700,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {d}
        </div>
      ))}
      {cells.map((cell, idx) => {
        const iso = dateToISO(cell);
        const isCurrentMonth = cell.getMonth() === month;
        const isToday = isSameDay(cell, today);
        const cellEvents = eventsByDate.get(iso) || [];
        const maxVisible = 3;
        const hidden = Math.max(0, cellEvents.length - maxVisible);

        return (
          <div
            key={iso + idx}
            onClick={() => onCellClick(iso)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData("taskId");
              const fromDate = e.dataTransfer.getData("fromDate");
              if (taskId && fromDate) {
                onTaskDrop?.(taskId, fromDate);
              }
            }}
            style={{
              minHeight: "100px",
              padding: "6px",
              background: isCurrentMonth ? "var(--bg-card)" : "var(--bg-surface)",
              cursor: "pointer",
              transition: "background 0.15s",
              position: "relative",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-surface)")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = isCurrentMonth ? "var(--bg-card)" : "var(--bg-surface)")
            }
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: isToday ? 800 : 500,
                color: isToday ? "var(--accent)" : isCurrentMonth ? "var(--text-primary)" : "var(--text-tertiary)",
                marginBottom: "4px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: isToday ? "var(--accent)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: "22px",
              }}
            >
              {cell.getDate()}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {[...cellEvents].sort(holidayFirst).slice(0, maxVisible).map((ev) => {
                const isProject = ev.kind === "project";
                const isHoliday = ev.kind === "holiday";
                const colors = colorsFor(ev);
                return (
                  <div
                    key={ev.id}
                    draggable={!isProject && !isHoliday}
                    onDragStart={(e) => {
                      if (isProject || isHoliday) return;
                      e.dataTransfer.setData("taskId", ev.id);
                      e.dataTransfer.setData("fromDate", ev.due_date);
                      onDragStart(ev, e);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isProject && !isHoliday) onTaskClick?.(ev.id);
                    }}
                    title={isProject ? `Project due: ${ev.title}` : isHoliday ? `Festival: ${ev.title}` : ev.title}
                    style={{
                      padding: "2px 5px",
                      borderRadius: "4px",
                      fontSize: "10px",
                      fontWeight: isHoliday ? 700 : 500,
                      background: colors.bg,
                      borderLeft: `2px solid ${colors.border}`,
                      color: colors.text,
                      cursor: isProject || isHoliday ? "default" : "grab",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    {isProject && <span style={{ fontWeight: 700, opacity: 0.9 }}>📅</span>}
                    {isHoliday && <span style={{ fontWeight: 700, opacity: 0.9 }}>{ev.emoji || "🎊"}</span>}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ev.title}
                    </span>
                  </div>
                );
              })}
              {hidden > 0 && (
                <div
                  style={{
                    fontSize: "10px",
                    color: "var(--text-tertiary)",
                    padding: "1px 4px",
                    cursor: "pointer",
                  }}
                >
                  +{hidden} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Week View ───────────────────────────────────────────────────────────────
function WeekGrid({
  anchor,
  events,
  onDragStart,
  onTaskDrop,
  onTaskClick,
}: {
  anchor: Date;
  events: CalendarEvent[];
  onDragStart: (ev: { id: string; due_date?: string }, e: React.DragEvent) => void;
  onTaskDrop?: (taskId: string, newDateISO: string) => void;
  onTaskClick?: (id: string) => void;
}) {
  const weekStart = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = new Date();

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((ev) => {
      const existing = map.get(ev.due_date) || [];
      existing.push(ev);
      map.set(ev.due_date, existing);
    });
    return map;
  }, [events]);

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: "700px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px repeat(7, 1fr)",
            borderBottom: "1px solid var(--border)",
            position: "sticky",
            top: 0,
            background: "var(--bg-surface)",
            zIndex: 2,
          }}
        >
          <div />
          {days.map((day) => (
            <div
              key={dateToISO(day)}
              style={{
                padding: "8px 4px",
                textAlign: "center",
                borderLeft: "1px solid var(--border)",
                background: isSameDay(day, today) ? "var(--accent-dim)" : "transparent",
              }}
            >
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {day.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: 700,
                  color: isSameDay(day, today) ? "var(--accent)" : "var(--text-primary)",
                }}
              >
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        {hours.map((hour) => (
          <div
            key={hour}
            style={{
              display: "grid",
              gridTemplateColumns: "60px repeat(7, 1fr)",
              borderBottom: "1px solid var(--border)",
              minHeight: "60px",
            }}
          >
            <div
              style={{
                padding: "4px 6px",
                fontSize: "10px",
                color: "var(--text-tertiary)",
                borderRight: "1px solid var(--border)",
                textAlign: "right",
              }}
            >
              {hour.toString().padStart(2, "0")}:00
            </div>
            {days.map((day) => {
              const iso = dateToISO(day);
              const cellEvents = (eventsByDate.get(iso) || []).filter((_, i) => i < 3);
              return (
                <div
                  key={iso}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData("taskId");
                    const fromDate = e.dataTransfer.getData("fromDate");
                    if (taskId && fromDate) {
                      onTaskDrop?.(taskId, fromDate);
                    }
                  }}
                  style={{
                    borderLeft: "1px solid var(--border)",
                    padding: "2px",
                    background: isSameDay(day, today) ? "var(--bg-card)" : "transparent",
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  {[...cellEvents].sort(holidayFirst).map((ev) => {
                    const isProject = ev.kind === "project";
                    const isHoliday = ev.kind === "holiday";
                    const colors = colorsFor(ev);
                    return (
                      <div
                        key={ev.id}
                        draggable={!isProject && !isHoliday}
                        onDragStart={(e) => {
                          if (isProject || isHoliday) return;
                          e.dataTransfer.setData("taskId", ev.id);
                          e.dataTransfer.setData("fromDate", ev.due_date);
                          onDragStart(ev, e);
                        }}
                        onClick={() => {
                          if (!isProject && !isHoliday) onTaskClick?.(ev.id);
                        }}
                        title={isProject ? `Project due: ${ev.title}` : isHoliday ? `Festival: ${ev.title}` : ev.title}
                        style={{
                          padding: "3px 5px",
                          borderRadius: "4px",
                          fontSize: "10px",
                          fontWeight: isHoliday ? 700 : 500,
                          background: colors.bg,
                          borderLeft: `2px solid ${colors.border}`,
                          color: colors.text,
                          cursor: isProject || isHoliday ? "default" : "grab",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {isProject ? `📅 ${ev.title}` : isHoliday ? `${ev.emoji || "🎊"} ${ev.title}` : ev.title}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Day View ─────────────────────────────────────────────────────────────────
function DayView({
  anchor,
  events,
  onDragStart,
  onTaskDrop,
  onTaskClick,
}: {
  anchor: Date;
  events: CalendarEvent[];
  onDragStart: (ev: { id: string; due_date?: string }, e: React.DragEvent) => void;
  onTaskDrop?: (taskId: string, newDateISO: string) => void;
  onTaskClick?: (id: string) => void;
}) {
  const iso = dateToISO(anchor);
  const dayEvents = events.filter((e) => e.due_date === iso);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: "500px" }}>
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            background: "var(--accent-dim)",
            borderRadius: "var(--radius-md)",
            marginBottom: "12px",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {anchor.toLocaleDateString("en-US", { weekday: "long" })}
          </div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
            {anchor.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {hours.map((hour) => {
          const hourEvents = [...dayEvents].sort(holidayFirst).slice(0, 5);
          return (
            <div
              key={hour}
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr",
                borderBottom: "1px solid var(--border)",
                minHeight: "70px",
              }}
            >
              <div
                style={{
                  padding: "6px 10px",
                  fontSize: "12px",
                  color: "var(--text-tertiary)",
                  borderRight: "1px solid var(--border)",
                  textAlign: "right",
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "flex-end",
                }}
              >
                {hour.toString().padStart(2, "0")}:00
              </div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const taskId = e.dataTransfer.getData("taskId");
                  const fromDate = e.dataTransfer.getData("fromDate");
                  if (taskId && fromDate) {
                    onTaskDrop?.(taskId, fromDate);
                  }
                }}
                style={{
                  borderLeft: "1px solid var(--border)",
                  padding: "4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "3px",
                }}
              >
                {hour === 9 && hourEvents.map((ev) => {
                  const isProject = ev.kind === "project";
                  const isHoliday = ev.kind === "holiday";
                  const colors = colorsFor(ev);
                  return (
                    <div
                      key={ev.id}
                      draggable={!isProject && !isHoliday}
                      onDragStart={(e) => {
                        if (isProject || isHoliday) return;
                        e.dataTransfer.setData("taskId", ev.id);
                        e.dataTransfer.setData("fromDate", ev.due_date);
                        onDragStart(ev, e);
                      }}
                      onClick={() => {
                        if (!isProject && !isHoliday) onTaskClick?.(ev.id);
                      }}
                      style={{
                        padding: "6px 10px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: isHoliday ? 700 : 500,
                        background: colors.bg,
                        borderLeft: `3px solid ${colors.border}`,
                        color: colors.text,
                        cursor: isProject || isHoliday ? "default" : "grab",
                        boxShadow: "0 1px 3px rgba(70,55,40,0.12)",
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{isHoliday ? `${ev.emoji || "🎊"} ${ev.title}` : ev.title}</div>
                      {isHoliday && (
                        <div style={{ fontSize: "10px", opacity: 0.7 }}>
                          {ev.holiday_type === "national" ? "🇮🇳 National holiday" : "🪔 Indian festival"}
                        </div>
                      )}
                      {isProject && (
                        <>
                          <div style={{ fontSize: "10px", opacity: 0.7 }}>
                            📅 Project due date
                          </div>
                          {ev.client_name && (
                            <div style={{ fontSize: "10px", opacity: 0.7 }}>🏢 {ev.client_name}</div>
                          )}
                          {ev.progress != null && (
                            <div style={{ fontSize: "10px", opacity: 0.7 }}>📊 {ev.progress}% complete</div>
                          )}
                        </>
                      )}
                      {!isProject && ev.project_name && (
                        <div style={{ fontSize: "10px", opacity: 0.7 }}>📁 {ev.project_name}</div>
                      )}
                      {!isProject && ev.assigned_name && (
                        <div style={{ fontSize: "10px", opacity: 0.7 }}>👤 {ev.assigned_name}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main CalendarView ────────────────────────────────────────────────────────
export function CalendarView({
  view,
  onChangeView,
  anchorDate,
  onChangeAnchorDate,
  events,
  loading,
  projects,
  assignees,
  projectFilter,
  assigneeFilter,
  priorityFilter,
  search,
  onChangeProjectFilter,
  onChangeAssigneeFilter,
  onChangePriorityFilter,
  onChangeSearch,
  onTaskClick,
  onTaskDueDateChange,
}: Props) {
  const anchor = isoToDate(anchorDate);
  const [dragTarget, setDragTarget] = useState<string | null>(null);

  const handlePrev = useCallback(() => {
    if (view === "month") onChangeAnchorDate(addDays(anchor, -30));
    else if (view === "week") onChangeAnchorDate(addDays(anchor, -7));
    else onChangeAnchorDate(addDays(anchor, -1));
  }, [view, anchor, onChangeAnchorDate]);

  const handleNext = useCallback(() => {
    if (view === "month") onChangeAnchorDate(addDays(anchor, 30));
    else if (view === "week") onChangeAnchorDate(addDays(anchor, 7));
    else onChangeAnchorDate(addDays(anchor, 1));
  }, [view, anchor, onChangeAnchorDate]);

  const handleToday = useCallback(() => onChangeAnchorDate(new Date()), [onChangeAnchorDate]);

  const handleDrop = useCallback(
    (taskId: string, newDateISO: string) => {
      onTaskDueDateChange(taskId, newDateISO);
    },
    [onTaskDueDateChange]
  );

  const handleDragStart = useCallback((ev: { id: string; due_date?: string }) => {
    setDragTarget(ev.id);
  }, []);

  const navTitle = useMemo(() => {
    if (view === "month") return anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (view === "week") {
      const ws = startOfWeek(anchor);
      const we = addDays(ws, 6);
      return `${formatDisplay(ws)} – ${formatDisplay(we)}, ${we.getFullYear()}`;
    }
    return anchor.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }, [view, anchor]);

  const upcomingEvents = useMemo(() => {
    const todayIso = dateToISO(new Date());
    return events
      .filter((ev) => ev.due_date >= todayIso)
      .sort((a, b) => (a.due_date < b.due_date ? -1 : 1))
      .slice(0, 8);
  }, [events]);

  const handleUpcomingClick = (iso: string) => {
    onChangeAnchorDate(isoToDate(iso));
    if (view !== "day") onChangeView("day");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {/* Left column: toolbar + calendar */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Toolbar */}
          <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
          padding: "12px 16px",
          background: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Navigation */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button onClick={handlePrev} className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: "16px" }}>
            ‹
          </button>
          <button onClick={handleToday} className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: "13px" }}>
            Today
          </button>
          <button onClick={handleNext} className="btn btn-ghost" style={{ padding: "6px 10px", fontSize: "16px" }}>
            ›
          </button>
        </div>

        <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", minWidth: "180px" }}>
          {navTitle}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          {(["month", "week", "day"] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => onChangeView(v)}
              className={view === v ? "btn btn-primary" : "btn btn-secondary"}
              style={{ padding: "6px 14px", fontSize: "12px" }}
            >
              {VIEW_LABELS[v]}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => onChangeSearch(e.target.value)}
          className="input"
          style={{ maxWidth: "200px", fontSize: "13px", padding: "7px 12px" }}
        />
        <select
          value={projectFilter}
          onChange={(e) => onChangeProjectFilter(e.target.value)}
          className="input"
          style={{ maxWidth: "160px", fontSize: "13px", padding: "7px 10px" }}
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => onChangeAssigneeFilter(e.target.value)}
          className="input"
          style={{ maxWidth: "160px", fontSize: "13px", padding: "7px 10px" }}
        >
          <option value="all">All Assignees</option>
          {assignees.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => onChangePriorityFilter(e.target.value)}
          className="input"
          style={{ maxWidth: "140px", fontSize: "13px", padding: "7px 10px" }}
        >
          <option value="all">All Priorities</option>
          <option value="urgent">🔴 Urgent</option>
          <option value="high">🟠 High</option>
          <option value="medium">🔵 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        <div style={{ marginLeft: "auto", fontSize: "12px", color: "var(--text-tertiary)" }}>
          {loading ? "Loading..." : `${events.length} event${events.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Calendar Grid */}
      <div
        style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)",
          overflow: "hidden",
        }}
      >
        {view === "month" && (
          <MonthGrid
            anchor={anchor}
            events={events}
            onDragStart={handleDragStart}
            onTaskDrop={handleDrop}
            onCellClick={(iso) => onChangeAnchorDate(isoToDate(iso))}
            onTaskClick={onTaskClick}
          />
        )}
        {view === "week" && (
          <WeekGrid
            anchor={anchor}
            events={events}
            onDragStart={handleDragStart}
            onTaskDrop={handleDrop}
            onTaskClick={onTaskClick}
          />
        )}
        {view === "day" && (
          <DayView
            anchor={anchor}
            events={events}
            onDragStart={handleDragStart}
            onTaskDrop={handleDrop}
            onTaskClick={onTaskClick}
          />
        )}
      </div>

      {/* Drop zone indicator */}
      {dragTarget && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--accent)",
            color: "#fff7ee",
            padding: "8px 20px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(70,55,40,0.22)",
            zIndex: 1000,
          }}
        >
          🖐️ Drop on a date to reschedule
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          justifyContent: "center",
          padding: "8px",
          fontSize: "12px",
          color: "var(--text-secondary)",
        }}
      >
        {Object.entries(PRIORITY_COLORS).map(([p, c]) => (
          <div key={p} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: c.border }} />
            <span style={{ textTransform: "capitalize" }}>{p}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: FESTIVAL_COLORS.border }} />
          <span>Festival</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: NATIONAL_COLORS.border }} />
          <span>National</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .calendar-grid { font-size: 11px !important; }
        }
      `}</style>
        </div>

        {/* Right column: sticky Upcoming Events note */}
        <aside
          style={{
            width: "260px",
            flexShrink: 0,
            position: "sticky",
            top: "16px",
            alignSelf: "flex-start",
          }}
        >
          <div
            style={{
              background: "linear-gradient(160deg, #fff8dc 0%, #ffedb3 100%)",
              border: "1px solid #e8d48b",
              borderRadius: "4px",
              boxShadow: "0 6px 16px rgba(120,90,20,0.18)",
              padding: "16px 14px",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-14px",
                left: "50%",
                transform: "translateX(-50%) rotate(-2deg)",
                background: "#f4b942",
                width: "90px",
                height: "26px",
                borderRadius: "2px 2px 8px 8px",
                opacity: 0.9,
              }}
            />
            <div
              style={{
                fontSize: "13px",
                fontWeight: 800,
                color: "#8a5a00",
                letterSpacing: "0.4px",
                textTransform: "uppercase",
                marginBottom: "10px",
              }}
            >
              🗓️ Upcoming Events
            </div>
            {upcomingEvents.length === 0 ? (
              <div style={{ fontSize: "12px", color: "#8a7a45", fontStyle: "italic" }}>
                No upcoming deadlines.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {upcomingEvents.map((ev) => {
                  const isProject = ev.kind === "project";
                  const isHoliday = ev.kind === "holiday";
                  const colors = colorsFor(ev);
                  return (
                    <button
                      key={ev.id}
                      onClick={() => handleUpcomingClick(ev.due_date)}
                      title={isProject ? `Project due: ${ev.title}` : isHoliday ? `Festival: ${ev.title}` : ev.title}
                      style={{
                        textAlign: "left",
                        background: isHoliday ? "rgba(255,248,235,0.95)" : "rgba(255,255,255,0.75)",
                        border: `1px solid ${colors.border}`,
                        borderLeft: `3px solid ${colors.border}`,
                        borderRadius: "4px",
                        padding: "6px 8px",
                        cursor: "pointer",
                        fontSize: "11px",
                        color: colors.text,
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        fontFamily: "inherit",
                      }}
                    >
                      <div style={{ fontWeight: 700 }}>
                        {formatDisplay(isoToDate(ev.due_date))}
                      </div>
                      <div style={{ fontWeight: isHoliday ? 700 : 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {isProject ? `📅 ${ev.title}` : isHoliday ? `${ev.emoji || "🎊"} ${ev.title}` : ev.title}
                      </div>
                      {isHoliday && (
                        <div style={{ fontSize: "10px", opacity: 0.75 }}>
                          {ev.holiday_type === "national" ? "🇮🇳 National holiday" : "Indian festival"}
                        </div>
                      )}
                      {ev.client_name && (
                        <div style={{ fontSize: "10px", opacity: 0.75 }}>🏢 {ev.client_name}</div>
                      )}
                      {isProject && ev.progress != null && (
                        <div style={{ fontSize: "10px", opacity: 0.75 }}>📊 {ev.progress}% complete</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
