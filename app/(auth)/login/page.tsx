"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCurrentUserRole } from "@/lib/getCurrentUserRole";
import AuthShell from "@/components/admin/AuthShell";
import Button from "@/components/admin/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      const role = await getCurrentUserRole();
      if (!isMounted) return;
      if (role) {
        router.replace(role === "admin" ? "/admin" : role === "member" ? "/member" : "/client");
        return;
      }
      setLoading(false);
    }
    void checkAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  async function login() {
    setError("");
    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    const signedInEmail =
      data.user?.email?.trim().toLowerCase() ||
      data.session?.user?.email?.trim().toLowerCase() ||
      email.trim().toLowerCase();
    const signedInUserId = data.user?.id || data.session?.user?.id || undefined;
    const role = await getCurrentUserRole(signedInEmail, signedInUserId);
    if (!role) {
      setError("Login succeeded, but we could not determine your role. Please check that your profile has a valid role.");
      return;
    }
    router.replace(role === "admin" ? "/admin" : role === "member" ? "/member" : "/client");
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg-base)",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: "2px solid var(--accent-soft)",
            borderTopColor: "var(--accent)",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "var(--text-tertiary)", fontSize: 14 }}>Checking authentication…</p>
      </div>
    );
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your workflow console"
      footer={
        <>
          Forgot your password?{" "}
          <a href="/forgot-password" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
            Reset it
          </a>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label className="label" htmlFor="email">
            Email address
          </label>
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              id="email"
              className="input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <input
              id="password"
              className="input"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--red)", fontSize: 13 }}>
            <AlertCircle size={15} /> {error}
          </div>
        )}

        <Button variant="primary" size="lg" loading={submitting} disabled={!email || !password} onClick={login} style={{ marginTop: 4 }}>
          {!submitting && <ArrowRight size={16} />}
          Sign in
        </Button>
      </div>
    </AuthShell>
  );
}
