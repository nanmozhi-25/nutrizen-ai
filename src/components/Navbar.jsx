import { useState, useEffect } from "react";
import { Bell, BellOff, Moon, Sun } from "lucide-react";
import "./Navbar.css";
import { requestNotificationPermission } from "../utils/notifications";
import { getStoredTheme, toggleTheme } from "../utils/theme";

function useLiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return now;
}

export default function Navbar() {
  const now = useLiveClock();
  const [notifOn, setNotifOn] = useState(
    "Notification" in window && Notification.permission === "granted"
  );
  const [dark, setDark] = useState(getStoredTheme() === "dark");

  function toggleNotifications() {
    requestNotificationPermission().then((perm) => setNotifOn(perm === "granted"));
  }

  function handleThemeToggle() {
    const next = toggleTheme();
    setDark(next === "dark");
  }

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="/logo.png" alt="NutriZen AI logo" className="app-logo" />
        <div className="brand-text">
          <h1>NutriZen AI</h1>
          <p>AI-Powered Nutrition & Meditation Assistant</p>
        </div>
      </div>

      <div className="navbar-right">
        <button
          className="notif-bell"
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
          onClick={handleThemeToggle}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          className="notif-bell"
          title={notifOn ? "Notifications on" : "Enable notifications"}
          onClick={toggleNotifications}
        >
          {notifOn ? <Bell size={18} /> : <BellOff size={18} />}
        </button>
        <div className="datetime-widget">
          <div className="time">{timeStr}</div>
          <div className="date">{dateStr}</div>
        </div>
      </div>
    </nav>
  );
}
