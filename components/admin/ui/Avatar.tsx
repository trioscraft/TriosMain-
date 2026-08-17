import clsx from "clsx";

export function Avatar({
  name,
  size = 36,
  className,
}: {
  name?: string | null;
  size?: number;
  className?: string;
}) {
  const initial = (name || "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className={clsx("avatar", className)}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-label={name || "User"}
    >
      {initial}
    </span>
  );
}
