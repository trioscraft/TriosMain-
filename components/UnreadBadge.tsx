export default function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) return null;

  return (
    <span
      style={{
        position: "absolute",
        top: -4,
        right: -4,
        display: "inline-flex",
        minWidth: "18px",
        height: "18px",
        padding: "0 5px",
        borderRadius: "999px",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, var(--accent-bright), var(--accent))",
        color: "#fff7ee",
        fontSize: "11px",
        fontWeight: 700,
        boxShadow: "0 0 12px -2px var(--accent-glow)",
      }}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
