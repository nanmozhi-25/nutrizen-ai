import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../utils/api";
import { useToast } from "../components/ToastContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const showToast = useToast();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await registerUser(form.name, form.email, form.password);
      localStorage.setItem("nz_token", token);
      localStorage.setItem("nz_user", JSON.stringify(user));
      showToast(`Account created — welcome, ${user.name}!`, "success");
      navigate("/");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
      showToast(err.message || "Registration failed", "error");
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
          <img src="/logo.svg" alt="NutriZen AI" style={{ width: 56, height: 56 }} />
          <h3 style={{ marginBottom: 0 }}>Create your account</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: 4 }}>
            Join NutriZen AI today
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label>Full Name</label>
            <input name="name" required onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Email</label>
            <input name="email" type="email" required onChange={handleChange} style={inputStyle} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label>Password</label>
            <input name="password" type="password" required minLength={6} onChange={handleChange} style={inputStyle} />
          </div>
          {error && <p style={{ color: "var(--color-danger)", fontSize: "0.85rem" }}>{error}</p>}
          <button className="btn btn-primary" type="submit" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>
        <p style={{ marginTop: 14, fontSize: "0.85rem" }}>
          Already have an account? <Link to="/login">Login</Link>
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
