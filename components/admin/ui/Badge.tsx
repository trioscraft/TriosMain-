import clsx from "clsx";

export type BadgeTone = "blue" | "green" | "amber" | "red" | "purple" | "brass";

const toneMap: Record<BadgeTone, string> = {
  blue: "badge-blue",
  green: "badge-green",
  amber: "badge-amber",
  red: "badge-red",
  purple: "badge-purple",
  brass: "badge-brass",
};

export default function Badge({
  tone = "blue",
  children,
  className,
  dot,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span className={clsx("badge", toneMap[tone], className)}>
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "currentColor",
            boxShadow: "0 0 8px currentColor",
          }}
        />
      )}
      {children}
    </span>
  );
}
