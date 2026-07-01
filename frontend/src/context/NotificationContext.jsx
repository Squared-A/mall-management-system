import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { dashboardApi } from "../api/dashboardApi";
import { useAuth } from "./AuthContext";
import { useMall } from "./MallContext";
import { storage } from "../utils/storage";
import { TOKEN_KEY } from "../constants";

const NotificationContext = createContext(null);

// Seed data — in production this would be fetched from /notifications
const SEED_NOTIFICATIONS = [
  {
    id: "n1",
    title: "New lease agreement signed",
    message: 'Tenant "Bright Coffee Co." signed lease for Shop #112.',
    time: "5 minutes ago",
    read: false,
    type: "success",
  },
  {
    id: "n2",
    title: "Maintenance request",
    message: "New maintenance request raised for HVAC in Wing B.",
    time: "1 hour ago",
    read: false,
    type: "warning",
  },
  {
    id: "n3",
    title: "Payment overdue",
    message: "Shop #204 rent payment is 3 days overdue.",
    time: "3 hours ago",
    read: false,
    type: "danger",
  },
  {
    id: "n4",
    title: "Monthly report ready",
    message: "October revenue report has been generated.",
    time: "1 day ago",
    read: true,
    type: "info",
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const token = storage.get(TOKEN_KEY);
  const { user } = useAuth();
  const { activeMallId } = useMall();

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await dashboardApi.getRecentActivities();
        const data = response?.data?.data;
        setNotifications(Array.isArray(data) ? data : SEED_NOTIFICATIONS);
      } catch (error) {
        setNotifications(SEED_NOTIFICATIONS);
      }
    };
    if (token && user) fetchActivities();
    // Previously depended on [token] only, so switching the active mall
    // (now possible via MallSelector) never refreshed the notification
    // feed — an owner would keep seeing Mall A's activity after switching
    // to Mall B until a full page reload.
  }, [token, activeMallId]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) =>
        n.id === id ? { ...n, read: true } : n,
      ),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      (Array.isArray(prev) ? prev : []).map((n) => ({ ...n, read: true })),
    );
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      { id: `n${Date.now()}`, read: false, time: "Just now", ...notification },
      ...(Array.isArray(prev) ? prev : []),
    ]);
  }, []);

  // Previously this `.forEach` mutated each notification object's `.time`
  // field IN PLACE outside of setState, on every render. That's a React
  // anti-pattern (mutating state without going through its setter), and
  // concretely broken here: after the first render replaced `n.time`
  // (e.g. "2024-11-01T10:00:00Z") with a formatted string ("Nov 1, 10:00
  // AM"), the next render fed that already-formatted string back into
  // `new Date(...)`, which produces "Invalid Date" — notification
  // timestamps would corrupt themselves after the first re-render.
  const notificationItems = (Array.isArray(notifications) ? notifications : []).map(
    (n) => {
      if (!n?.time) return n;
      const parsed = new Date(n.time);
      if (Number.isNaN(parsed.getTime())) return n; // already formatted / not a real date
      return {
        ...n,
        time: parsed.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    },
  );
  const unreadCount = notificationItems.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: notificationItems,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  return ctx;
};
