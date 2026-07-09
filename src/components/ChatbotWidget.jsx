import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { getBotResponse, QUICK_QUESTIONS } from "../utils/chatbot";
import { todayKey } from "../utils/storage";
import { fetchCalories, fetchWater } from "../utils/api";
import { playClick } from "../utils/sound";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about meals, calories, sleep, weight loss, or hydration." },
  ]);
  const [input, setInput] = useState("");
  const [context, setContext] = useState({});
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const today = todayKey();
    Promise.all([fetchCalories(today), fetchWater(today)])
      .then(([calorieLog, water]) => {
        const used = (calorieLog.entries || []).reduce((s, e) => s + e.calories, 0);
        setContext({
          remainingCalories: Math.max(0, (calorieLog.goal || 2000) - used),
          waterRemaining: Math.max(0, (water.goal || 8) - (water.glasses || 0)),
          waterGoal: water.goal || 8,
        });
      })
      .catch(() => {});
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  function send(text) {
    const question = (text ?? input).trim();
    if (!question) return;
    const reply = getBotResponse(question, context);
    setMessages((prev) => [...prev, { from: "user", text: question }, { from: "bot", text: reply }]);
    setInput("");
    playClick();
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Ask NutriZen AI"
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 900,
          background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
          color: "#fff",
          border: "none",
          borderRadius: 999,
          padding: open ? "12px" : "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontWeight: 700,
          fontSize: "0.85rem",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        }}
      >
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        {!open && "Ask NutriZen AI"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 88,
            right: 24,
            width: 320,
            maxWidth: "calc(100vw - 32px)",
            height: 420,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: 16,
            boxShadow: "0 12px 36px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 900,
            animation: "pageFade 0.2s ease both",
          }}
        >
          <div style={{ padding: "12px 14px", background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))", color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} />
            <strong style={{ fontSize: "0.85rem" }}>NutriZen AI Assistant</strong>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                  background: m.from === "user" ? "var(--color-primary)" : "var(--color-bg)",
                  color: m.from === "user" ? "#fff" : "var(--color-text)",
                  padding: "8px 12px",
                  borderRadius: 12,
                  fontSize: "0.8rem",
                  maxWidth: "85%",
                  lineHeight: 1.4,
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ padding: "0 12px 8px", display: "flex", flexWrap: "wrap", gap: 6 }}>
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} className="suggestion-chip" style={{ fontSize: "0.7rem", padding: "4px 10px" }} onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            style={{ display: "flex", gap: 6, padding: 10, borderTop: "1px solid var(--color-border)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--color-border)", fontSize: "0.82rem" }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: "8px 12px" }}>
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
