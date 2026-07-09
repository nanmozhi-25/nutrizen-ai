import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../utils/api";
import { useToast } from "../components/ToastContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await loginUser(email, password);
      localStorage.setItem("nz_token", token);
      localStorage.setItem("nz_user", JSON.stringify(user));
      showToast(`Welcome back, ${user.name}!`, "success");
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      showToast(err.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))",
    }}>
      <div className="card" style={{ maxWidth: 400, width: "90%" }}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <img src="/logo.png" alt="NutriZen AI" style={{ width: 56, height: 56 }} />
          <h3 style={{ marginBottom: 0 }}>Welcome to NutriZen AI</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 4 }}>
            AI-Powered Nutrition & Meditation Assistant
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
          </div>
          {error && <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>{error}</p>}
          <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ marginTop: 14, fontSize: "0.85rem" }}>
          No account? <Link to="/register">Register here</Link>
        </p>
      </div>
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
