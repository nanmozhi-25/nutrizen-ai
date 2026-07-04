import { useEffect, useState } from "react";
import { User, Target, Droplet, Flame, Calendar, Mail } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { SkeletonBlock } from "../components/Skeleton";
import { todayKey } from "../utils/storage";
import { fetchGoals, fetchWater, fetchCalories, getCurrentUser } from "../utils/api";

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ goalsDone: 0, goalsTotal: 0, water: 0, calories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("nz_user");
    if (raw) setUser(JSON.parse(raw));

    const today = todayKey();
    Promise.all([getCurrentUser(), fetchGoals(), fetchWater(today), fetchCalories(today)])
      .then(([fullUser, goals, water, calorieLog]) => {
        setUser(fullUser);
        setStats({
          goalsDone: goals.filter((g) => g.done).length,
          goalsTotal: goals.length,
          water: water.glasses || 0,
          calories: (calorieLog.entries || []).reduce((s, e) => s + e.calories, 0),
        });
      })
      .catch(() => {
        // non-critical — leave whatever we already have from localStorage
      })
      .finally(() => setLoading(false));
  }, []);

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div>
      <PageHeader icon={User} title="Profile" subtitle="Your account and today's snapshot." />

      <div className="card" style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.3rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {getInitials(user?.name)}
        </div>
        <div>
          <h3 style={{ margin: 0 }}>{user ? user.name : "Guest"}</h3>
          {loading ? (
            <SkeletonBlock width={160} height={14} style={{ marginTop: 8 }} />
          ) : (
            <>
              <p style={{ color: "var(--color-text-muted)", margin: "4px 0 0", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                <Mail size={14} /> {user ? user.email : "Not logged in"}
              </p>
              {joinedDate && (
                <p style={{ color: "var(--color-text-muted)", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
                  <Calendar size={14} /> Member since {joinedDate}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="stat-card" style={{ background: "var(--accent-goals-bg)", border: "none" }}>
          <div className="stat-label" style={{ color: "var(--accent-goals-icon)", display: "flex", alignItems: "center", gap: 6 }}>
            <Target size={13} /> Goals
          </div>
          <div className="stat-value" style={{ color: "var(--accent-goals-icon)" }}>{stats.goalsDone} / {stats.goalsTotal}</div>
        </div>
        <div className="stat-card" style={{ background: "var(--accent-water-bg)", border: "none" }}>
          <div className="stat-label" style={{ color: "var(--accent-water-icon)", display: "flex", alignItems: "center", gap: 6 }}>
            <Droplet size={13} /> Water Today
          </div>
          <div className="stat-value" style={{ color: "var(--accent-water-icon)" }}>{stats.water} glasses</div>
        </div>
        <div className="stat-card" style={{ background: "var(--accent-calories-bg)", border: "none" }}>
          <div className="stat-label" style={{ color: "var(--accent-calories-icon)", display: "flex", alignItems: "center", gap: 6 }}>
            <Flame size={13} /> Calories Today
          </div>
          <div className="stat-value" style={{ color: "var(--accent-calories-icon)" }}>{stats.calories} kcal</div>
        </div>
      </div>
    </div>
  );
}
