// Simple localStorage helper so every page can save/load data
// without a backend. Swap these with real API calls later.

export function loadData(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — fail silently
  }
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// Returns an array of { key, label } for the last `days` days, oldest first.
// key is YYYY-MM-DD (matches todayKey format), label is short weekday name.
export function lastNDays(days = 7) {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-IN", { weekday: "short" });
    result.push({ key, label });
  }
  return result;
}
