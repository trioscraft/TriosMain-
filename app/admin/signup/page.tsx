"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  async function signUp() {
    const { data, error } =
      await supabase.auth.signUp({
        email,
        password,
      });

    if (error) {
      alert(error.message);
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
          },
        ]);
    }

    alert("Account created!");

    router.push("/admin/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center text-white">
      <div className="bg-slate-900 p-8 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6">
          Sign Up
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 bg-slate-800 rounded mb-4"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 bg-slate-800 rounded mb-4"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        <button
          onClick={signUp}
          className="w-full bg-green-600 p-3 rounded"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}