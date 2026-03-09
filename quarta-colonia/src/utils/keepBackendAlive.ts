const KEEP_ALIVE_URL = "https://quartacolonia24.onrender.com/health";
const KEEP_ALIVE_INTERVAL_MS = 4 * 60 * 1000;

export function keepBackendAlive() {
  async function ping() {
    try {
      await fetch(KEEP_ALIVE_URL, {
        method: "GET",
        cache: "no-store",
      });
    } catch {
      console.warn("Keep alive ping failed");
    }
  }

  if (document.visibilityState === "visible") {
    void ping();
  }

  window.setInterval(() => {
    if (document.visibilityState === "visible") {
      void ping();
    }
  }, KEEP_ALIVE_INTERVAL_MS);
}
