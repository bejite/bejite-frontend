self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Bejite", body: event.data?.text() || "" };
  }

  const title = payload.title || "Bejite";
  const options = {
    body: payload.body || "",
    icon: "/Bejite-icon.svg",
    badge: "/assets/images/notification.svg",
    data: payload.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// self.addEventListener("notificationclick", (event) => {
//   event.notification.close();
//   const relativeUrl = event.notification.data?.url || "/news-feed";
//   const targetUrl = new URL(relativeUrl, self.location.origin).href;

//   event.waitUntil(
//     clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
//       for (const client of windowClients) {
//         if (client.url.startsWith(self.location.origin) && "focus" in client) {
//           return client.focus();
//         }
//       }
//       if (clients.openWindow) {
//         return clients.openWindow(targetUrl);
//       }
//       return undefined;
//     })
//   );
// });


self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const relativeUrl = event.notification.data?.url || "/news-feed";
  const targetUrl = new URL(relativeUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    })
  );
});