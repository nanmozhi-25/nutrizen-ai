const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("nz_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

// ---------- Auth ----------
export const registerUser = (name, email, password) =>
  request("/api/auth/register", { method: "POST", body: { name, email, password }, auth: false });

export const loginUser = (email, password) =>
  request("/api/auth/login", { method: "POST", body: { email, password }, auth: false });

export const getCurrentUser = () => request("/api/auth/me");

// ---------- Goals ----------
export const fetchGoals = () => request("/api/goals");
export const createGoal = (text) => request("/api/goals", { method: "POST", body: { text } });
export const toggleGoal = (id) => request(`/api/goals/${id}`, { method: "PATCH" });
export const deleteGoal = (id) => request(`/api/goals/${id}`, { method: "DELETE" });

// ---------- Water ----------
export const fetchWater = (date) => request(`/api/water/${date}`);
export const updateWater = (date, body) => request(`/api/water/${date}`, { method: "PUT", body });
export const fetchWaterHistory = (days = 7) => request(`/api/water?days=${days}`);

// ---------- Calories ----------
export const fetchCalories = (date) => request(`/api/calories/${date}`);
export const addCalorieEntry = (date, food, calories) =>
  request(`/api/calories/${date}`, { method: "POST", body: { food, calories } });
export const updateCalorieGoal = (date, goal) =>
  request(`/api/calories/${date}/goal`, { method: "PUT", body: { goal } });
export const fetchCalorieHistory = (days = 7) => request(`/api/calories?days=${days}`);
