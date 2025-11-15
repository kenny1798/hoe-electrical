import { useEffect, useState } from 'react';
import axios from 'axios';
import { getCurrentSubscription } from './getCurrentSubscription';
import { subscribeUser } from './subscribeUser';
import { msmartAxios } from '../api/axios';
import { useAuthContext } from '../hooks/useAuthContext';

function SubscribeStatus() {
  const [isSubscribed, setIsSubscribed] = useState(null);
  const {user} = useAuthContext();

  useEffect(() => {

    const checkSubscription = async () => {
      const sub = await getCurrentSubscription();
      if (sub) {
        try {
          const res = await msmartAxios.post('/api/subscription/check-subscription', {
            endpoint: sub.endpoint
          }, {headers: {accessToken: user.token}});

          setIsSubscribed(res.data.exists);
        } catch (err) {
          console.error('❌ Failed to check subscription:', err);
          setIsSubscribed(false);
        }
      } else {
        setIsSubscribed(false);
      }
    };

    checkSubscription();
  }, [user]);

  return (
    <div>
      {isSubscribed === null ? (
        <p>Loading...</p>
      ) : isSubscribed ? (
        <p>✅ Dah subscribe</p>
      ) : (
        <button onClick={() => subscribeUser(user)}>🔔 Subscribe</button>
      )}
    </div>
  );
}

export default SubscribeStatus;
