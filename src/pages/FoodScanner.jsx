import { useState } from "react";
import { Camera, Loader2, Plus, Sparkles } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { loadData, saveData, todayKey } from "../utils/storage";
import { playSuccess } from "../utils/sound";
import { useToast } from "../components/ToastContext";

// Mock nutrition lookup — replace this function with a real API call
// (e.g. Clarifai / Google Vision / your own model) when your backend is ready.
function mockAnalyzeImage(fileName) {
  const sample = [
    {
      food: "Grilled Chicken Salad", calories: 320, protein: 28, carbs: 12, fat: 16,
      suggestions: ["Add avocado for healthy fats", "Swap dressing for lemon + olive oil", "Pair with quinoa for extra protein"],
    },
    {
      food: "Apple", calories: 95, protein: 0.5, carbs: 25, fat: 0.3,
      suggestions: ["Pair with a handful of almonds for protein", "Great pre-workout snack", "Try with peanut butter for satiety"],
    },
    {
      food: "Rice & Dal", calories: 450, protein: 14, carbs: 78, fat: 8,
      suggestions: ["Add a side salad for fiber", "Try brown rice for lower GI", "Add a boiled egg for extra protein"],
    },
    {
      food: "Vegetable Sandwich", calories: 260, protein: 9, carbs: 34, fat: 9,
      suggestions: ["Use whole wheat bread for more fiber", "Add hummus instead of mayo", "Pair with a fruit for balance"],
    },
  ];
  const idx = fileName.length % sample.length;
  return sample[idx];
}

export default function FoodScanner() {
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const showToast = useToast();

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file));
    setResult(null);
    setLoading(true);

    // Simulate analysis delay — swap with real API call
    setTimeout(() => {
      const analyzed = mockAnalyzeImage(file.name);
      setResult(analyzed);
      setLoading(false);
    }, 1200);
  }

  function logToDiary() {
    if (!result) return;
    const key = `nz_diary_${todayKey()}`;
    const entries = loadData(key, []);
    entries.push({ ...result, time: new Date().toLocaleTimeString() });
    saveData(key, entries);
    playSuccess();
    showToast(`${result.food} added to Food Diary`, "success");
  }

  return (
    <div>
      <PageHeader icon={Camera} title="Food Scanner" subtitle="Upload a food photo to identify calories and nutrition." />

      <div className="card">
        <h3>Scan Food Image</h3>
        <input type="file" accept="image/*" onChange={handleFileChange} />

        {preview && (
          <img
            src={preview}
            alt="Preview"
            style={{ marginTop: 16, maxWidth: 260, borderRadius: 12, display: "block" }}
          />
        )}

        {loading && (
          <p style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)" }}>
            <Loader2 size={16} className="spin" /> Analyzing image...
          </p>
        )}

        {result && !loading && (
          <div style={{ marginTop: 18 }}>
            <h4>{result.food}</h4>
            <div className="grid-2" style={{ marginTop: 10 }}>
              <StatBox label="Calories" value={`${result.calories} kcal`} />
              <StatBox label="Protein" value={`${result.protein} g`} />
              <StatBox label="Carbs" value={`${result.carbs} g`} />
              <StatBox label="Fat" value={`${result.fat} g`} />
            </div>

            <div className="suggestion-box">
              <div className="suggestion-title">
                <Sparkles size={15} /> Suggestions to improve this meal
              </div>
              <ul>
                {result.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>

            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={logToDiary}>
              <Plus size={16} /> Add to Food Diary
            </button>
          </div>
        )}
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div
      style={{
        background: "var(--color-bg)",
        borderRadius: 10,
        padding: "10px 14px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--color-primary-dark)" }}>
        {value}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{label}</div>
    </div>
  );
}
