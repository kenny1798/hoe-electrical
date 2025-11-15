// ✅ useSubscribePush.js (React Hook)

import { useState, useEffect } from 'react';
import axios from 'axios';
import { msmartAxios } from '../api/axios';

export function getDeviceFingerprint() {

    const platform = navigator.userAgentData?.platform || 'unknown';

    const screenSize = {
        width: window.screen.width,
        height: window.screen.height,
      };

  return {
    userAgent: navigator.userAgent,
    platform,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: screenSize,
  };
}

export function useSubscribePush(user) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAndSubscribe = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        let subscription = await registration.pushManager.getSubscription();

        const deviceId = localStorage.getItem('device_id') || crypto.randomUUID();
        localStorage.setItem('device_id', deviceId);

        const fingerprint = getDeviceFingerprint();

        if (!subscription) {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return setIsSubscribed(false);

          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
          });
        }

        await msmartAxios.post(`/api/subscription/save-subscription`, {
          deviceId,
          subscription,
          fingerprint
        }, {headers:{ accessToken: user.token }});

        setIsSubscribed(true);
      } catch (err) {
        console.error("❌ Push subscribe failed:", err);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    checkAndSubscribe();
  }, [user]);

  return { isSubscribed, loading };
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}