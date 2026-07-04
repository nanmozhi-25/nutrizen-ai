import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import { ToastProvider } from "./components/ToastContext";
import { seedDemoData } from "./utils/seedData";
import { requestNotificationPermission, startReminder } from "./utils/notifications";
import { initTheme } from "./utils/theme";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FoodScanner from "./pages/FoodScanner";
import FoodDiary from "./pages/FoodDiary";
import CalorieTracker from "./pages/CalorieTracker";
import WaterTracker from "./pages/WaterTracker";
import BMICalculator from "./pages/BMICalculator";
import MealPlanner from "./pages/MealPlanner";
import Goals from "./pages/Goals";
import Achievements from "./pages/Achievements";
import Meditation from "./pages/Meditation";
import Breathing from "./pages/Breathing";
import Profile from "./pages/Profile";
import "./theme.css";

initTheme();

function isLoggedIn() {
  return !!localStorage.getItem("nz_token");
}

function ProtectedLayout({ children }) {
  const location = useLocation();
  if (!isLoggedIn()) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <div className="app-layout">
        <Sidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <main className="main-content page-transition" key={location.pathname}>
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </>
  );
}

export default function App() {
  useEffect(() => {
    // Fill the app with realistic sample data on first run
    seedDemoData();

    // Ask for notification permission and start a water reminder
    // (every 60 min) once the user allows it.
    if (isLoggedIn()) {
      requestNotificationPermission().then((perm) => {
        if (perm === "granted") {
          const stop = startReminder(
            "NutriZen AI",
            "Time to drink a glass of water!",
            60
          );
          return stop;
        }
      });
    }
  }, []);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/food-scanner" element={<ProtectedLayout><FoodScanner /></ProtectedLayout>} />
          <Route path="/food-diary" element={<ProtectedLayout><FoodDiary /></ProtectedLayout>} />
          <Route path="/calorie-tracker" element={<ProtectedLayout><CalorieTracker /></ProtectedLayout>} />
          <Route path="/water-tracker" element={<ProtectedLayout><WaterTracker /></ProtectedLayout>} />
          <Route path="/bmi-calculator" element={<ProtectedLayout><BMICalculator /></ProtectedLayout>} />
          <Route path="/meal-planner" element={<ProtectedLayout><MealPlanner /></ProtectedLayout>} />
          <Route path="/goals" element={<ProtectedLayout><Goals /></ProtectedLayout>} />
          <Route path="/achievements" element={<ProtectedLayout><Achievements /></ProtectedLayout>} />
          <Route path="/meditation" element={<ProtectedLayout><Meditation /></ProtectedLayout>} />
          <Route path="/breathing" element={<ProtectedLayout><Breathing /></ProtectedLayout>} />
          <Route path="/profile" element={<ProtectedLayout><Profile /></ProtectedLayout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
