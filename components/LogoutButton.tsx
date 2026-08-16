"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  return (
    <button
      onClick={logout}
      style={{
        background: "#dc2626",
        color: "white",
        padding: "10px 12px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: 600,
        width: "100%",
      }}
    >
      🚪 Logout
    </button>
  );
}