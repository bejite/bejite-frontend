import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { fetchAdminInbox } from "../services/adminInboxApi";

const POLL_MS = 60_000;

const AdminInboxContext = createContext(null);

export function AdminInboxProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    verification: 0,
    adpro: 0,
    contact: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const data = await fetchAdminInbox();
      setNotifications(data.notifications);
      setCounts(data.counts);
      setError(null);
      return true;
    } catch (err) {
      console.error("Failed to load admin inbox:", err);
      setError(err);
      if (!silent) {
        setNotifications([]);
        setCounts({ total: 0, verification: 0, adpro: 0, contact: 0 });
      }
      if (!silent) {
        throw err;
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh().catch(() => {});
    const intervalId = setInterval(() => {
      refresh({ silent: true });
    }, POLL_MS);
    const onFocus = () => refresh({ silent: true });
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({
      notifications,
      counts,
      unreadCount: counts.total,
      loading,
      error,
      refresh,
    }),
    [notifications, counts, loading, error, refresh],
  );

  return (
    <AdminInboxContext.Provider value={value}>
      {children}
    </AdminInboxContext.Provider>
  );
}

export function useAdminInbox() {
  const context = useContext(AdminInboxContext);
  if (!context) {
    throw new Error("useAdminInbox must be used within AdminInboxProvider");
  }
  return context;
}
