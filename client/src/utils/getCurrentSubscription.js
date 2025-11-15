export async function getCurrentSubscription() {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
  
      if (subscription) {
        return {
          endpoint: subscription.endpoint,
          keys: subscription.toJSON().keys
        };
      }
    }
  
    return null;
  }
  