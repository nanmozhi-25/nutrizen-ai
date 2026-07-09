// Browser Notification API wrapper + simple reminder scheduling.

export function requestNotificationPermission() {
  if (!("Notification" in window)) return Promise.resolve("unsupported");
  if (Notification.permission === "granted") return Promise.resolve("granted");
  if (Notification.permission === "denied") return Promise.resolve("denied");
  return Notification.requestPermission();
}

export function sendNotification(title, body, icon = "/logo.png") {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    // eslint-disable-next-line no-new
    new Notification(title, { body, icon });
  } catch {
    // some browsers block Notification() in certain contexts — fail silently
  }
}

// Starts a repeating reminder (e.g. "drink water") every `intervalMinutes`.
// Returns a cleanup function to stop it.
export function startReminder(title, body, intervalMinutes = 60) {
  const id = setInterval(() => {
    sendNotification(title, body);
  }, intervalMinutes * 60 * 1000);
  return () => clearInterval(id);
}
