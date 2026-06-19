import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext(null);

// Seed data — in production this would be fetched from /notifications
const SEED_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'New lease agreement signed',
    message: 'Tenant "Bright Coffee Co." signed lease for Shop #112.',
    time: '5 minutes ago',
    read: false,
    type: 'success',
  },
  {
    id: 'n2',
    title: 'Maintenance request',
    message: 'New maintenance request raised for HVAC in Wing B.',
    time: '1 hour ago',
    read: false,
    type: 'warning',
  },
  {
    id: 'n3',
    title: 'Payment overdue',
    message: 'Shop #204 rent payment is 3 days overdue.',
    time: '3 hours ago',
    read: false,
    type: 'danger',
  },
  {
    id: 'n4',
    title: 'Monthly report ready',
    message: 'October revenue report has been generated.',
    time: '1 day ago',
    read: true,
    type: 'info',
  },
];

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [
      { id: `n${Date.now()}`, read: false, time: 'Just now', ...notification },
      ...prev,
    ]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within a NotificationProvider');
  return ctx;
};
