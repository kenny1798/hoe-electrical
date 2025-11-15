import { msmartAxios } from "../api/axios";



const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

// helper convert VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export async function subscribeUser(user) {
  // 1. Request Permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.warn('Permission not granted for notification');
    return;
  }

  // 2. Register SW & Subscribe
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // 3. Hantar ke backend
  await msmartAxios.post('/api/subscription/save-subscription', {
    subscription,
  }, {headers: {
    accessToken:user.token}}).then((response) => {
      console.log(response.data);
    })

  console.log('✅ User subscribed and sent to backend');
}
