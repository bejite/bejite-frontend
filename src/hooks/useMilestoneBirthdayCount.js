import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
} from "../services/notificationService";
import { NOTIFICATIONS_UNREAD_UPDATED } from "../utils/headerBadgeEvents";
import { onNotificationNew } from "../services/socketClient";

/** Celebration push type that deep-links to /milestones */
export const BIRTHDAY_CELEBRATION_TYPES = ["birthday"];

const POLL_MS = 30000;

function hasAuthToken() {
  return Boolean(
    localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("token"),
  );
}

function formatBadgeCount(count) {
  if (count > 99) return "99+";
  return String(count);
}

function isMilestonesPath(pathname) {
  return typeof pathname === "string" && pathname.startsWith("/milestones");
}

/**
 * Module singleton: one poll, one socket listener, one clear-in-flight,
 * shared across RecruitmentLeft + NewsFeedHeader.
 */
const store = {
  count: 0,
  pathname: "/",
  subscribers: new Set(),
  started: false,
  pollTimer: null,
  unsubscribeSocket: null,
  refreshPromise: null,
  clearPromise: null,
  refreshEpoch: 0,
};

function emit() {
  for (const listener of store.subscribers) {
    listener(store.count);
  }
}

function setCount(next) {
  const value = Math.max(0, Number(next) || 0);
  if (store.count === value) return;
  store.count = value;
  emit();
}

async function refreshCount() {
  if (store.refreshPromise) return store.refreshPromise;

  const epoch = ++store.refreshEpoch;
  store.refreshPromise = (async () => {
    try {
      if (!hasAuthToken()) {
        if (epoch === store.refreshEpoch) setCount(0);
        return;
      }
      const next = await fetchUnreadNotificationCount({
        types: BIRTHDAY_CELEBRATION_TYPES,
      });
      if (epoch !== store.refreshEpoch) return;
      setCount(next);
    } catch (err) {
      console.error("Error fetching milestone birthday count:", err);
    } finally {
      store.refreshPromise = null;
    }
  })();

  return store.refreshPromise;
}

async function clearCelebrationUnread() {
  if (!isMilestonesPath(store.pathname)) return;
  if (store.clearPromise) return store.clearPromise;

  store.clearPromise = (async () => {
    try {
      if (!hasAuthToken()) {
        setCount(0);
        return;
      }
      // Optimistically clear badge; reconcile from server after.
      setCount(0);
      await markAllNotificationsRead({ types: BIRTHDAY_CELEBRATION_TYPES });
      await refreshCount();
    } catch (err) {
      console.error("Error clearing birthday celebration notifications:", err);
      await refreshCount();
    } finally {
      store.clearPromise = null;
    }
  })();

  return store.clearPromise;
}

function onUnreadUpdated() {
  if (isMilestonesPath(store.pathname)) {
    // Keep Milestones view clear; avoid badge flicker while on the page.
    if (store.count !== 0) setCount(0);
    return;
  }
  refreshCount();
}

function onSocketNotification(payload) {
  if (payload?.type !== "birthday") return;

  if (isMilestonesPath(store.pathname)) {
    clearCelebrationUnread();
    return;
  }

  // Reconcile from server (avoids optimistic drift).
  refreshCount();
}

function startStore() {
  if (store.started || typeof window === "undefined") return;
  store.started = true;
  refreshCount();
  store.pollTimer = setInterval(() => {
    if (isMilestonesPath(store.pathname)) return;
    refreshCount();
  }, POLL_MS);
  window.addEventListener(NOTIFICATIONS_UNREAD_UPDATED, onUnreadUpdated);
  store.unsubscribeSocket = onNotificationNew(onSocketNotification);
}

function stopStore() {
  if (store.subscribers.size > 0) return;
  if (!store.started) return;

  store.started = false;
  // Invalidate in-flight refresh writes; leave clearPromise so a remount can coalesce.
  store.refreshEpoch += 1;
  store.refreshPromise = null;

  if (store.pollTimer) {
    clearInterval(store.pollTimer);
    store.pollTimer = null;
  }
  if (typeof store.unsubscribeSocket === "function") {
    store.unsubscribeSocket();
    store.unsubscribeSocket = null;
  }
  if (typeof window !== "undefined") {
    window.removeEventListener(NOTIFICATIONS_UNREAD_UPDATED, onUnreadUpdated);
  }
}

function subscribe(listener) {
  store.subscribers.add(listener);
  listener(store.count);
  startStore();
  return () => {
    store.subscribers.delete(listener);
    stopStore();
  };
}

function syncPathname(pathname) {
  const prev = store.pathname;
  const next = pathname || "/";
  if (prev === next) return;
  store.pathname = next;

  if (isMilestonesPath(next)) {
    clearCelebrationUnread();
    return;
  }

  if (isMilestonesPath(prev)) {
    refreshCount();
  }
}

/**
 * Unread birthday-celebration notification count for the Milestones sidebar badge.
 * Shared singleton — safe to call from header + left sidebar at once.
 */
export function useMilestoneBirthdayCount() {
  const location = useLocation();
  const [count, setLocalCount] = useState(() => store.count);

  useEffect(() => subscribe(setLocalCount), []);

  useEffect(() => {
    syncPathname(location.pathname);
  }, [location.pathname]);

  return {
    count,
    label: count > 0 ? formatBadgeCount(count) : null,
  };
}
