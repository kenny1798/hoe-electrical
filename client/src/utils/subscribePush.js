// ✅ subscribePush.js (Trigger untuk user tekan button subscribe)

import { getDeviceFingerprint } from '../hooks/useSubscribePush';
import { msmartAxios } from '../api/axios';

function urlBase64ToUint8Array(base64String) {
    console.log(base64String)
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}


export async function subscribePush(user) {
  try {
    const registration = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('Notification not granted');

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY),
    });

    const deviceId = localStorage.getItem('device_id') || crypto.randomUUID();
    localStorage.setItem('device_id', deviceId);

    const fingerprint = getDeviceFingerprint();

    await msmartAxios.post(`/api/subscription/save-subscription`, {
      deviceId,
      subscription,
      fingerprint,
    }, {
      headers: { accessToken: user.token }
    });

    return { success: true };
  } catch (err) {
    console.error('❌ Error subscribing push:', err);
    return { success: false, error: err.message };
  }
}
