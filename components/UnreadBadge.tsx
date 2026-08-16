export default function UnreadBadge({ count }: { count: number }) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      style={{
        display: "inline-flex",
        minWidth: "22px",
        height: "22px",
        padding: "0 8px",
        borderRadius: "999px",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--accent)",
        color: "white",
        fontSize: "12px",
        fontWeight: 700,
      }}
    >
      {count}
    </span>
  );
}
