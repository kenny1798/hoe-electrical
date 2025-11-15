/* eslint-disable no-restricted-globals */
self.addEventListener('push', function (event) {
  console.log("🔔 Push received");

  let data = { title: 'No title', body: 'No body', url: '/' };

  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    console.error("❌ Error parsing data", e);
  }

  const options = {
    body: data.body,
    icon: '/logo192.png',
    data: {
      url: data.url // attach route into noti data
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  console.log("🖱️ Noti clicked");
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});
