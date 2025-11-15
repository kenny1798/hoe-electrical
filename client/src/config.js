const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

if (!VAPID_PUBLIC_KEY) {
  console.warn("⚠️ VAPID_PUBLIC_KEY not found. Check .env or restart server.");
}

export { VAPID_PUBLIC_KEY };