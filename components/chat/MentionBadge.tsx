"use client";

import Link from "next/link";

export default function MentionBadge({
  userId,
  display,
}: {
  userId: string;
  display: string;
}) {
  // Assumes you have a profile page route. Adjust if different.
  const href = `/admin/profile/${userId}`;

  return (
    <Link
      href={href}
      className="mention-badge"
      style={{ color: "#2563eb", fontWeight: 600 }}
    >
      @{display}
    </Link>
  );
}

