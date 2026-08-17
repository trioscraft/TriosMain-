"use client";

import { useState } from "react";
import { Mail, Lock, UserPlus, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/admin/AuthShell";
import Button from "@/components/admin/ui/Button";
import { Field, Input } from "@/components/admin/ui/Field";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function signUp() {
    setError("");
    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").insert([{ id: data.user.id, email: data.user.email }]);
    }
    router.push("/admin/login");
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Spin up a new TriosFlow workspace"
      footer={
        <>
          Already have an account?{" "}
          <a href="/admin/login" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
            Sign in
          </a>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Field label="Email address" htmlFor="email">
          <div style={{ position: "relative" }}>
            <Mail size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: 40 }} />
          </div>
        </Field>

        <Field label="Password" htmlFor="password">
          <div style={{ position: "relative" }}>
            <Lock size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <Input
              id="password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </Field>

        {error && <div style={{ color: "var(--red)", fontSize: 13 }}>{error}</div>}

        <Button variant="primary" size="lg" loading={submitting} disabled={!email || !password} onClick={signUp} style={{ marginTop: 4 }}>
          {!submitting && <UserPlus size={16} />}
          Create account
        </Button>
      </div>
    </AuthShell>
  );
}
