export default function Footer() {
  return (
    <footer className="app-footer">
      <div style={{ fontWeight: 700, color: "var(--color-text)", fontSize: "0.9rem" }}>NutriZen AI</div>
      <div>AI Powered Nutrition &amp; Meditation Assistant</div>
      <div style={{ marginTop: 6, opacity: 0.8 }}>
        Version 1.0 &middot; Developed by Nanmozhi Tamilarasan &middot; &copy; {new Date().getFullYear()}
      </div>
    </footer>
  );
}
