import { useState } from "react";
import { Scale, Lightbulb } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { playSuccess } from "../utils/sound";
import { useToast } from "../components/ToastContext";
import { saveData, loadData } from "../utils/storage";

function getCategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight", color: "var(--color-warning)", tip: "Consider nutrient-dense foods like nuts, dairy, and whole grains to reach a healthy weight." };
  if (bmi < 25) return { label: "Normal", color: "var(--accent-goals-icon)", tip: "Great! Maintain your current habits with balanced meals and regular activity." };
  if (bmi < 30) return { label: "Overweight", color: "var(--color-warning)", tip: "Small changes like more vegetables and daily walks can help you move toward a healthy range." };
  return { label: "Obese", color: "var(--color-danger)", tip: "Consider consulting a healthcare provider for a personalized nutrition and activity plan." };
}

export default function BMICalculator() {
  const [height, setHeight] = useState(""); // cm
  const [weight, setWeight] = useState(""); // kg
  const [bmi, setBmi] = useState(null);
  const showToast = useToast();

  function calculate(e) {
    e.preventDefault();
    if (!height || !weight) return;
    const h = height / 100;
    const value = weight / (h * h);
    setBmi(value.toFixed(1));
    const today = new Date().toISOString().slice(0, 10);
    const record = { value: Number(value.toFixed(1)), date: today };
    saveData("nz_last_bmi", { ...record, date: new Date().toISOString() });
    const history = loadData("nz_bmi_history", []);
    saveData("nz_bmi_history", [...history.filter((h) => h.date !== today), record].sort((a, b) => a.date.localeCompare(b.date)));
    playSuccess();
    showToast("BMI calculated", "success");
  }

  const category = bmi ? getCategory(Number(bmi)) : null;

  return (
    <div>
      <PageHeader icon={Scale} title="BMI Calculator" subtitle="Check your Body Mass Index in seconds." />

      <div className="card" style={{ maxWidth: 420 }}>
        <h3>Enter your details</h3>
        <form onSubmit={calculate}>
          <div style={{ marginBottom: 14 }}>
            <label>Height (cm)</label>
            <input
              type="number"
              value={height}
              required
              onChange={(e) => setHeight(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Weight (kg)</label>
            <input
              type="number"
              value={weight}
              required
              onChange={(e) => setWeight(e.target.value)}
              style={inputStyle}
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
            Calculate BMI
          </button>
        </form>

        {bmi && (
          <div style={{ marginTop: 20, textAlign: "center" }}>
            <div style={{ fontSize: "2rem", fontWeight: 700 }}>{bmi}</div>
            <div style={{ color: category.color, fontWeight: 600 }}>{category.label}</div>
          </div>
        )}
      </div>

      {bmi && (
        <div className="suggestion-box" style={{ maxWidth: 420 }}>
          <div className="suggestion-title">
            <Lightbulb size={15} /> Suggestion
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted)" }}>{category.tip}</p>
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid var(--color-border)",
  marginTop: 4,
  fontFamily: "inherit",
};
