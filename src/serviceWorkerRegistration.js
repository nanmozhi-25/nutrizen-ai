// Registers the service worker so the app becomes installable and can
// serve cached content when offline. Safe no-op in unsupported browsers.

export function register() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/service-worker.js")
        .then((registration) => {
          console.log("NutriZen AI service worker registered:", registration.scope);
        })
        .catch((error) => {
          console.log("Service worker registration failed:", error);
        });
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
