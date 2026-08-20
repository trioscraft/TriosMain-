"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import AuthShell from "@/components/admin/AuthShell";
import Button from "@/components/admin/ui/Button";
import { Field, Input } from "@/components/admin/ui/Field";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
  }

  if (sent) {
    return (
      <AuthShell title="Check your email">
        <div className="empty-state" style={{ border: "none", background: "transparent", padding: "8px 0 0" }}>
          <div className="empty-state-icon">
            <CheckCircle2 size={24} />
          </div>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.6 }}>
            We&apos;ve sent a reset link to <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
          </p>
        </div>
        <Button variant="primary" size="lg" onClick={() => router.push("/login")} style={{ marginTop: 20 }}>
          Back to login
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot password?"
      subtitle="Enter your email and we'll send a reset link."
      footer={
        <>
          Remember it?{" "}
          <a href="/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
            Sign in
          </a>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Email address" htmlFor="email">
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: 40 }} required />
          </div>
        </Field>

        {error && <div style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>}

        <Button type="submit" variant="primary" size="lg" loading={loading} disabled={!email} style={{ marginTop: 4 }}>
          {!loading && <ArrowRight size={16} />}
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
