import { useState, useEffect } from 'react';
import { msmartAxios } from '../api/axios';

export function useCheckSubscription(user) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) {
        setLoading(false);
        setIsSubscribed(false);
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          setIsSubscribed(false);
          return;
        }

        const res = await msmartAxios.post(
          '/api/subscription/check-subscription',
          { endpoint: subscription.endpoint },
          { headers: { accessToken: user.token } }
        );

        setIsSubscribed(res.data.exists);
      } catch (err) {
        console.error('❌ Failed to check subscription:', err);
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [user]);

  return { isSubscribed, loading };
}
