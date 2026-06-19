import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  LogOut,
  Settings,
  User as UserIcon,
  Search,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { toggleMobileSidebar } from '../../store/slices/uiSlice';
import Avatar from '../common/Avatar';
import { ROLE_LABELS } from '../../constants/roles';

const NOTIF_DOT = {
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
};

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-surface-dark/80 backdrop-blur px-4 sm:px-6">
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={() => dispatch(toggleMobileSidebar())}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden sm:block max-w-md flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search malls, shops, tenants..."
            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-9 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative rounded-lg p-2 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-danger-500" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl animate-fadeIn overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-4 py-3">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-50">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary-600 hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-gray-400">No notifications yet</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={clsx(
                        'flex w-full gap-3 border-b border-gray-50 dark:border-gray-800/50 px-4 py-3 text-left text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
                        !n.read && 'bg-primary-50/40 dark:bg-primary-500/5'
                      )}
                    >
                      <span className={clsx('mt-1.5 h-2 w-2 shrink-0 rounded-full', NOTIF_DOT[n.type] || 'bg-gray-400')} />
                      <span>
                        <span className="block font-medium text-gray-800 dark:text-gray-100">{n.title}</span>
                        <span className="block text-gray-500 dark:text-gray-400">{n.message}</span>
                        <span className="mt-1 block text-xs text-gray-400">{n.time}</span>
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-tight">
                {user?.name || 'Guest User'}
              </p>
              <p className="text-xs text-gray-400 leading-tight">
                {ROLE_LABELS[user?.role] || 'User'}
              </p>
            </div>
            <ChevronDown className="hidden sm:block h-4 w-4 text-gray-400" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xl animate-fadeIn overflow-hidden py-1.5">
              <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <UserIcon className="h-4 w-4" /> My Profile
              </button>
              <button className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                <Settings className="h-4 w-4" /> Settings
              </button>
              <hr className="my-1 border-gray-100 dark:border-gray-800" />
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
