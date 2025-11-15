import { createContext, useContext, useEffect, useState } from 'react';
import { msmartAxios } from '../api/axios';
import { useAuthContext } from '../hooks/useAuthContext';

const PushStatusContext = createContext();

export function PushStatusProvider({ children }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const {user} = useAuthContext();

  // Auto check bila load
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        if (!sub) {
          setIsSubscribed(false);
          return;
        }

        // Optional: fetch token from localStorage/session/userContext
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await msmartAxios.post(
          '/api/subscription/check-subscription',
          { endpoint: sub.endpoint },
          { headers: { accessToken: user.token } }
        );

        setIsSubscribed(res.data.exists);
      } catch (err) {
        console.error('❌ Error checking subscription:', err);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  return (
    <PushStatusContext.Provider value={{ isSubscribed, setIsSubscribed, loading, setLoading }}>
      {children}
    </PushStatusContext.Provider>
  );
}

export function usePushStatus() {
  return useContext(PushStatusContext);
}
