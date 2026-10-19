import { useEffect } from "react";
import { isAuthenticated } from "../utils/tokenManager";
import {
  getNotificationPreferences,
  isPushSupported,
  subscribeToPushNotifications,
  syncPushSubscriptionIfEnabled,
} from "../services/pushNotificationService";

/**
 * Ensures notification preferences exist (server defaults) and registers push
 * when push is enabled and the browser has not denied permission.
 */
export default function PushNotificationBootstrap() {
  useEffect(() => {
    if (!isAuthenticated()) return;

    let cancelled = false;

    (async () => {
      try {
        const prefs = await getNotificationPreferences();
        if (cancelled || !prefs.push_enabled || !isPushSupported()) return;

        if (Notification.permission === "granted") {
          await syncPushSubscriptionIfEnabled();
        } else if (Notification.permission === "default") {
          await subscribeToPushNotifications();
        }
      } catch (error) {
        console.warn("PushNotificationBootstrap:", error?.message || error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
