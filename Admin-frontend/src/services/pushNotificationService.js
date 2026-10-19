import axiosInstance from "../utils/axiosInstance";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function getNotificationPreferences() {
  const response = await axiosInstance.get("/api/notifications/preferences");
  return response.data;
}

export async function updateNotificationPreferences({
  push_enabled,
  email_enabled,
  sms_enabled,
} = {}) {
  const body = {};
  if (typeof push_enabled === "boolean") body.push_enabled = push_enabled;
  if (typeof email_enabled === "boolean") body.email_enabled = email_enabled;
  if (typeof sms_enabled === "boolean") body.sms_enabled = sms_enabled;

  const response = await axiosInstance.patch("/api/notifications/preferences", body);
  return response.data;
}

async function getServiceWorkerRegistration() {
  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });
  await navigator.serviceWorker.ready;
  return registration;
}

export async function subscribeToPushNotifications() {
  if (!isPushSupported()) {
    throw new Error("Push notifications are not supported in this browser");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was denied");
  }

  const { data } = await axiosInstance.get("/api/notifications/push/vapid-public-key");
  if (!data?.publicKey) {
    throw new Error("Push notifications are not configured on the server");
  }

  const registration = await getServiceWorkerRegistration();
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    });
  }

  await axiosInstance.post("/api/notifications/push/subscribe", {
    subscription: subscription.toJSON(),
  });

  return subscription;
}

export async function unsubscribeFromPushNotifications() {
  if (!isPushSupported()) {
    return;
  }

  const registration = await navigator.serviceWorker.getRegistration("/sw.js");
  const subscription = registration
    ? await registration.pushManager.getSubscription()
    : null;

  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    await axiosInstance.delete("/api/notifications/push/subscribe", {
      data: { endpoint },
    });
  } else {
    await axiosInstance.delete("/api/notifications/push/subscribe", {
      data: {},
    });
  }

  await updateNotificationPreferences({ push_enabled: false });
}

export async function syncPushSubscriptionIfEnabled() {
  if (!isPushSupported()) return false;
  if (Notification.permission !== "granted") return false;

  try {
    const prefs = await getNotificationPreferences();
    if (!prefs.push_enabled) return false;

    const { data } = await axiosInstance.get("/api/notifications/push/vapid-public-key");
    if (!data?.publicKey) return false;

    const registration = await getServiceWorkerRegistration();
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });
    }

    await axiosInstance.post("/api/notifications/push/subscribe", {
      subscription: subscription.toJSON(),
    });
    return true;
  } catch (error) {
    console.warn("syncPushSubscriptionIfEnabled:", error?.message || error);
    return false;
  }
}
