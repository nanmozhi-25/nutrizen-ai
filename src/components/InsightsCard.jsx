import { Lightbulb, CheckCircle2, AlertTriangle, Info } from "lucide-react";

const ICONS = { success: CheckCircle2, warning: AlertTriangle, info: Info };
const COLORS = {
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  info: "var(--color-primary)",
};

export default function InsightsCard({ tips }) {
  return (
    <div className="card">
      <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Lightbulb size={18} color="var(--color-secondary)" /> Today's Insights
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {tips.map((tip, i) => {
          const Icon = ICONS[tip.type] || Info;
          const color = COLORS[tip.type] || "var(--color-primary)";
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: `color-mix(in srgb, ${color} 8%, transparent)`,
              }}
            >
              <Icon size={16} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: "0.85rem", color: "var(--color-text)" }}>{tip.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
