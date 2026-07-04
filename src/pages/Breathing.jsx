import { useState, useEffect, useRef } from "react";
import { Wind } from "lucide-react";
import PageHeader from "../components/PageHeader";

// Simple box-breathing pattern: inhale 4s, hold 4s, exhale 4s, hold 4s
const PHASES = [
  { label: "Breathe In", seconds: 4 },
  { label: "Hold", seconds: 4 },
  { label: "Breathe Out", seconds: 4 },
  { label: "Hold", seconds: 4 },
];

export default function Breathing() {
  const [active, setActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(PHASES[0].seconds);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(() => {
      setCount((c) => {
        if (c > 1) return c - 1;
        setPhaseIndex((idx) => (idx + 1) % PHASES.length);
        return PHASES[(phaseIndex + 1) % PHASES.length].seconds;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, phaseIndex]);

  function toggle() {
    if (active) {
      setActive(false);
      setPhaseIndex(0);
      setCount(PHASES[0].seconds);
    } else {
      setActive(true);
    }
  }

  const phase = PHASES[phaseIndex];
  const scale = phase.label === "Breathe In" ? 1.3 : phase.label === "Breathe Out" ? 0.8 : 1.1;

  return (
    <div>
      <PageHeader icon={Wind} title="Breathing Exercise" subtitle="Box breathing — 4s in, 4s hold, 4s out, 4s hold." />

      <div className="card" style={{ textAlign: "center" }}>
        <div
          style={{
            width: 160,
            height: 160,
            margin: "20px auto",
            borderRadius: "50%",
            background: "radial-gradient(circle, var(--color-primary), var(--color-primary-dark))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 700,
            transform: active ? `scale(${scale})` : "scale(1)",
            transition: "transform 1s ease-in-out",
          }}
        >
          {active ? count : "Ready?"}
        </div>

        <h3>{active ? phase.label : "Press start when ready"}</h3>

        <button className="btn btn-primary" onClick={toggle}>
          {active ? "Stop" : "Start Breathing"}
        </button>
      </div>
    </div>
  );
}
