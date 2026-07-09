import { ArrowUp, ArrowDown, Minus } from "lucide-react";

// Shows a small colored badge like "+12%" or "-3" with an arrow,
// matching the trend-indicator pattern from modern analytics dashboards.
export default function TrendBadge({ current, previous, suffix = "%" }) {
  if (previous === undefined || previous === null) return null;

  let diff, isUp, display;

  if (previous === 0) {
    if (current === 0) {
      isUp = null;
      display = "0" + suffix;
    } else {
      isUp = true;
      display = "New";
    }
  } else {
    diff = Math.round(((current - previous) / previous) * 100);
    isUp = diff > 0;
    display = `${diff > 0 ? "+" : ""}${diff}${suffix}`;
    if (diff === 0) isUp = null;
  }

  const color = isUp === null
    ? "var(--color-text-muted)"
    : isUp
      ? "var(--color-success)"
      : "var(--color-danger)";

  const Icon = isUp === null ? Minus : isUp ? ArrowUp : ArrowDown;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        fontSize: "0.72rem",
        fontWeight: 700,
        color,
        background: color === "var(--color-text-muted)" ? "transparent" : `color-mix(in srgb, ${color} 12%, transparent)`,
        padding: "2px 8px",
        borderRadius: 999,
      }}
    >
      <Icon size={11} strokeWidth={3} />
      {display}
    </span>
  );
}
