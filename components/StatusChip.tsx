const statusClassMap: Record<string, string> = {
  active: "cp-chip--active",
  completed: "cp-chip--completed",
  "in progress": "cp-chip--active",
  "on hold": "cp-chip--onhold",
  onhold: "cp-chip--onhold",
  pending: "cp-chip--pending",
  overdue: "cp-chip--overdue",
  paid: "cp-chip--paid",
  sent: "cp-chip--sent",
  draft: "cp-chip--draft",
  approved: "cp-chip--approved",
  rejected: "cp-chip--rejected",
  cancelled: "cp-chip--cancelled",
  delivered: "cp-chip--completed",
  paused: "cp-chip--onhold",
};

export default function StatusChip({
  status,
  className = "",
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const key = (status || "pending").toLowerCase();
  const chipClass = statusClassMap[key] || "cp-chip--neutral";
  return (
    <span className={`cp-chip ${chipClass} ${className}`}>
      <span className="cp-chip-dot" />
      {status || "Pending"}
    </span>
  );
}