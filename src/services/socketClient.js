import { io } from "socket.io-client";
import { API_URL } from "../config";

let socket = null;
const listeners = new Set();

function getAccessToken() {
  return (
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token")
  );
}

/**
 * Shared app socket — joins user:{id} on the server for notification:new.
 */
export function connectAppSocket() {
  const token = getAccessToken();
  if (!token || !API_URL) return null;

  if (socket?.connected) return socket;

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(API_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 2000,
  });

  socket.on("notification:new", (payload) => {
    for (const listener of listeners) {
      try {
        listener(payload);
      } catch (err) {
        console.error("notification listener:", err);
      }
    }
  });

  socket.on("connect_error", (err) => {
    console.warn("App socket connect_error:", err?.message || err);
  });

  return socket;
}

export function disconnectAppSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Subscribe to realtime notifications. Returns an unsubscribe fn.
 */
export function onNotificationNew(callback) {
  if (typeof callback !== "function") return () => {};
  listeners.add(callback);
  connectAppSocket();
  return () => {
    listeners.delete(callback);
  };
}

export function getAppSocket() {
  return socket;
}
