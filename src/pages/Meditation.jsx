import { useState, useEffect, useRef } from "react";
import { Wind } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { playChime } from "../utils/sound";
import { sendNotification } from "../utils/notifications";
import { useToast } from "../components/ToastContext";

const SESSIONS = [3, 5, 10, 15];

export default function Meditation() {
  const [duration, setDuration] = useState(5);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [running, setRunning] = useState(false);
  const showToast = useToast();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => s - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setRunning(false);
      playChime();
      sendNotification("Session Complete", `Great job completing your ${duration} min meditation!`);
      showToast("Meditation session complete", "success");
    }
    return () => clearInterval(intervalRef.current);
  }, [running, secondsLeft]);

  function start(mins) {
    setDuration(mins);
    setSecondsLeft(mins * 60);
    setRunning(true);
    playChime();
  }

  function stop() {
    setRunning(false);
    setSecondsLeft(null);
  }

  const mm = secondsLeft !== null ? String(Math.floor(secondsLeft / 60)).padStart(2, "0") : "00";
  const ss = secondsLeft !== null ? String(secondsLeft % 60).padStart(2, "0") : "00";

  return (
    <div>
      <PageHeader icon={Wind} title="Meditation" subtitle="Take a few minutes to reset your mind." />

      <div className="card" style={{ textAlign: "center" }}>
        {secondsLeft === null ? (
          <>
            <h3>Choose a session length</h3>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {SESSIONS.map((m) => (
                <button key={m} className="btn btn-primary" onClick={() => start(m)}>
                  {m} min
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: 160,
                height: 160,
                margin: "20px auto",
                borderRadius: "50%",
                background: "radial-gradient(circle, var(--color-secondary-light), var(--color-secondary))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "1.6rem",
                fontWeight: 700,
                animation: running ? "pulse 4s ease-in-out infinite" : "none",
              }}
            >
              {mm}:{ss}
            </div>
            <p style={{ color: "var(--color-text-muted)" }}>
              {running ? "Breathe in... breathe out..." : "Session complete"}
            </p>
            <button className="btn btn-secondary" onClick={stop}>
              {secondsLeft === 0 ? "Done" : "End Session"}
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
