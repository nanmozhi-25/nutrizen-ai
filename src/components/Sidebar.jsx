import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Camera, BookOpen, Flame, Droplet, Scale,
  UtensilsCrossed, Target, Trophy, Wind, User, LogOut,
} from "lucide-react";
import "./Sidebar.css";

const links = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/food-scanner", icon: Camera, label: "Food Scanner" },
  { to: "/food-diary", icon: BookOpen, label: "Food Diary" },
  { to: "/calorie-tracker", icon: Flame, label: "Calorie Tracker" },
  { to: "/water-tracker", icon: Droplet, label: "Water Tracker" },
  { to: "/bmi-calculator", icon: Scale, label: "BMI Calculator" },
  { to: "/meal-planner", icon: UtensilsCrossed, label: "Meal Planner" },
  { to: "/goals", icon: Target, label: "Goals" },
  { to: "/achievements", icon: Trophy, label: "Achievements" },
  { to: "/meditation", icon: Wind, label: "Meditation" },
  { to: "/breathing", icon: Wind, label: "Breathing" },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("nz_token");
    localStorage.removeItem("nz_user");
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/logo.svg" alt="NutriZen AI" />
        <span>NutriZen AI</span>
      </div>
      {links.map((l) => {
        const Icon = l.icon;
        return (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Icon size={18} strokeWidth={2} /> {l.label}
          </NavLink>
        );
      })}
      <div className="sidebar-logout">
        <a href="#logout" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
          <LogOut size={18} strokeWidth={2} /> Logout
        </a>
      </div>
    </aside>
  );
}
