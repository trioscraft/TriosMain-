"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserRole, UserRole } from "@/lib/getCurrentUserRole";

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
};

export default function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function verifyRole() {
      const role = await getCurrentUserRole();

      if (!isMounted) {
        return;
      }

      console.log("RoleGuard - role:", role, "allowedRoles:", allowedRoles);

      if (!role) {
        console.log("RoleGuard - no role found, redirecting to /login");
        router.replace("/login");
        return;
      }

      if (!allowedRoles.includes(role)) {
        const redirectTo =
          role === "admin"
            ? "/admin"
            : role === "member"
            ? "/member"
            : "/client";
        console.log(
          "RoleGuard - unauthorized role, redirecting to:",
          redirectTo
        );
        router.replace(redirectTo);
        return;
      }

      setAuthorized(true);
    }

    void verifyRole();

    return () => {
      isMounted = false;
    };
  }, [allowedRoles, router]);

  if (!authorized) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-secondary)",
          padding: "24px",
        }}
      >
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
