import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

export interface AppNotification {
  id: string;
  type: "safety" | "trip" | "community" | "system";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  icon?: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

const STORAGE_KEY = "safestride_notifications";

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "welcome",
    type: "system",
    title: "Welcome to SafeStride!",
    message: "Your AI safety companion is ready. Set up emergency contacts in Settings.",
    timestamp: Date.now() - 3600000,
    read: false,
    icon: "👋",
  },
  {
    id: "community1",
    type: "community",
    title: "New Safety Report Nearby",
    message: "A poorly lit street has been reported near Andheri West. Stay alert on this route.",
    timestamp: Date.now() - 7200000,
    read: false,
    icon: "⚠️",
  },
  {
    id: "safety1",
    type: "safety",
    title: "Safety Tip of the Day",
    message: "Share your live location with a trusted contact when traveling after dark.",
    timestamp: Date.now() - 14400000,
    read: true,
    icon: "💡",
  },
];

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const addNotification = useCallback(
    (n: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      const newNotif: AppNotification = {
        ...n,
        id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        read: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    },
    []
  );

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
