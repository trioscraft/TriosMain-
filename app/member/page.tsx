"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import RoleGuard from "@/components/RoleGuard";
import { supabase } from "@/lib/supabase";
import { Timer, ListTodo, TrendingUp, Calendar, Bell, CircleUser, ArrowRight } from "lucide-react";

export default function MemberDashboardPage() {
  const [profileName, setProfileName] = useState("Member");
  const [taskCount, setTaskCount] = useState(0);
  const [doneCount, setDoneCount] = useState(0);
  const [hoursLogged, setHoursLogged] = useState("0");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        if (user.email) setProfileName(user.email);

        const { data: profile } = await supabase
          .from("profiles")
          .select("name")
          .eq("email", user.email || "")
          .single();
        if (profile?.name) setProfileName(profile.name);

        const { count: total } = await supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("assigned_to", user.id);
        if (typeof total === "number") setTaskCount(total);

        const { count: done } = await supabase
          .from("tasks")
          .select("id", { count: "exact", head: true })
          .eq("assigned_to", user.id)
          .eq("status", "completed");
        if (typeof done === "number") setDoneCount(done);

        const { data: entries } = await supabase
          .from("time_entries")
          .select("total_hours")
          .eq("user_id", user.id);
        const hours = (entries || []).reduce((sum, e) => sum + Number(e.total_hours || 0), 0);
        setHoursLogged(hours.toFixed(1));
      }
      setLoading(false);
    })();
  }, []);

  const statCards = [
    { label: "Assigned tasks", value: String(taskCount), tone: "var(--accent-bright)" },
    { label: "Completed", value: String(doneCount), tone: "var(--green)" },
    { label: "Hours logged", value: `${hoursLogged}h`, tone: "var(--info)" },
  ];

  const quickLinks = [
    { href: "/member/my-tasks", icon: ListTodo, label: "My Tasks", desc: "Stay on top of assigned work" },
    { href: "/member/timer", icon: Timer, label: "Work Timer", desc: "Log time against projects" },
    { href: "/member/my-earnings", icon: TrendingUp, label: "My Earnings", desc: "Track hours and pay" },
    { href: "/member/calendar", icon: Calendar, label: "Calendar", desc: "View deadlines" },
    { href: "/member/notifications", icon: Bell, label: "Notifications", desc: "Review your alerts" },
    { href: "/member/profile", icon: CircleUser, label: "Profile", desc: "Edit your details" },
  ];

  return (
    <RoleGuard allowedRoles={["member"]}>
      <div style={{ maxWidth: 960, margin: "0 auto", animation: "fadeUp 0.5s ease both" }}>
        <div style={{ marginBottom: 26 }}>
          <div className="section-label" style={{ marginBottom: 8 }}>Welcome back</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Hello, {profileName}
          </h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 4, fontSize: 14 }}>
            Here&apos;s a snapshot of your workspace.
          </p>
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: 120 }} />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 14,
              marginBottom: 24,
            }}
          >
            {statCards.map((s, i) => (
              <div
                key={s.label}
                className="stat-card"
                style={{ animation: `fadeUp 0.45s ease both`, animationDelay: `${i * 60}ms` }}
              >
                <div className="m-metric-label">{s.label}</div>
                <div className="m-metric" style={{ color: s.tone, fontSize: 26 }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <div className="m-section">Quick actions</div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 14,
          }}
        >
          {quickLinks.map(({ href, icon: Icon, label, desc }, i) => (
            <Link
              key={href}
              href={href}
              className="card"
              style={{
                padding: "20px",
                textDecoration: "none",
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
                animation: `fadeUp 0.4s ease both`,
                animationDelay: `${i * 50}ms`,
                transition: "all var(--transition-fast)",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "var(--radius-md)",
                  background: "var(--accent-soft)",
                  border: "1px solid var(--border-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--accent)",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <span style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 15 }}>
                    {label}
                  </span>
                  <ArrowRight size={15} style={{ color: "var(--text-tertiary)" }} />
                </div>
                <div style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}