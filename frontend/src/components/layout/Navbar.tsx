import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Sparkles,
  Check,
  Trash2,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { NotificationItem } from '../../types';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const { user, theme, toggleTheme } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [healthStatus, setHealthStatus] = useState<any>(null);

  const fetchNotifications = async () => {
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch {
      // Ignored
    }
  };

  useEffect(() => {
    fetchNotifications();
    api.getHealth().then(setHealthStatus).catch(() => {});

    // Refresh notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications(prev =>
      prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
    );
  };

  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await api.dismissNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Garden Overview', subtitle: 'Welcome back to your botanical space' },
    plants: { title: 'My Plants', subtitle: 'Your personal digital garden collection' },
    scan: { title: 'Plant Identifier', subtitle: 'Instant botanical taxonomy and care metrics' },
    diagnose: { title: 'Disease Diagnosis', subtitle: 'Visual leaf pathology and non-chemical care' },
    reminders: { title: 'Care Reminders', subtitle: 'Scheduled watering, feeding, and pruning' },
    calendar: { title: 'Care Calendar', subtitle: 'Visual schedule of garden maintenance' },
    chat: { title: 'AI Plant Doctor', subtitle: 'Ask botanical and horticulture questions' },
    growth: { title: 'Growth Tracking', subtitle: 'Measure plant development and leaf milestones' },
    learning: { title: 'Learning Center', subtitle: 'Botanical care encyclopedia and guides' },
    settings: { title: 'Settings & Profile', subtitle: 'Preferences, time zone, and account management' },
  };

  const currentInfo = tabTitles[currentTab] || { title: 'FloraAI', subtitle: 'Botanical Assistant' };

  return (
    <header className="sticky top-0 z-20 bg-botanical-card/90 dark:bg-botanical-darkCard/90 backdrop-blur-md border-b border-botanical-border dark:border-botanical-darkBorder px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Left Title and Mobile Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl text-botanical-muted hover:text-forest-700 hover:bg-forest-50 dark:hover:bg-forest-950/40"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div>
          <h2 className="text-lg sm:text-xl font-bold text-forest-950 dark:text-leaf-200 tracking-tight flex items-center gap-2">
            {currentInfo.title}
          </h2>
          <p className="hidden sm:block text-xs text-botanical-muted dark:text-botanical-darkMuted">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* AI Engine Status Pill */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-forest-50 dark:bg-forest-950/60 border border-forest-200 dark:border-forest-800 text-forest-800 dark:text-leaf-300">
          <Sparkles className="w-3.5 h-3.5 text-leaf-500 animate-subtle-pulse" />
          <span>{healthStatus?.gemini_ai_configured ? 'Gemini 1.5 Flash Vision' : 'FloraAI Engine (Offline)'}</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-botanical-muted dark:text-botanical-darkMuted hover:text-forest-700 dark:hover:text-leaf-300 hover:bg-forest-50 dark:hover:bg-forest-950/50 transition-colors"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-botanical-muted dark:text-botanical-darkMuted hover:text-forest-700 dark:hover:text-leaf-300 hover:bg-forest-50 dark:hover:bg-forest-950/50 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-botanical-darkCard" />
            )}
          </button>

          {showNotifications && (
            <>
              {/* Mobile Backdrop to close on tap outside */}
              <div
                className="fixed inset-0 z-40 bg-forest-950/20 backdrop-blur-[1px] sm:hidden"
                onClick={() => setShowNotifications(false)}
              />
              <div className="fixed inset-x-3 sm:inset-x-auto sm:absolute sm:right-0 top-16 sm:top-full sm:mt-2 sm:w-96 bg-botanical-card dark:bg-botanical-darkCard rounded-2xl shadow-elevated border border-botanical-border dark:border-botanical-darkBorder p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-botanical-border/60 dark:border-botanical-darkBorder/60">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-forest-900 dark:text-leaf-200">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-forest-100 text-forest-800 dark:bg-forest-900/60 dark:text-leaf-300 font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-forest-700 dark:text-leaf-400 hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-botanical-border/40 dark:divide-botanical-darkBorder/40 py-1">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-botanical-muted dark:text-botanical-darkMuted">
                    No notifications yet. You're all caught up! 🌿
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleMarkRead(notif.id)}
                      className={`py-3 px-2 rounded-xl transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                        notif.read_at ? 'opacity-70' : 'bg-forest-50/50 dark:bg-forest-950/30'
                      }`}
                    >
                      <div className="space-y-0.5 flex-1">
                        <p className="text-xs font-semibold text-forest-950 dark:text-leaf-100">{notif.title}</p>
                        <p className="text-[11px] text-botanical-muted dark:text-botanical-darkMuted leading-relaxed">{notif.message}</p>
                      </div>
                      <button
                        onClick={(e) => handleDismiss(notif.id, e)}
                        className="p-1 rounded text-botanical-muted hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Dismiss"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
        </div>

        {/* User Avatar Click to Settings */}
        <button
          onClick={() => onTabChange('settings')}
          className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-xl border border-botanical-border dark:border-botanical-darkBorder hover:bg-forest-50 dark:hover:bg-forest-950/40 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-forest-700 text-white flex items-center justify-center text-xs font-bold overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'F'
            )}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-forest-900 dark:text-leaf-200">
            {user?.full_name?.split(' ')[0] || 'Profile'}
          </span>
        </button>
      </div>
    </header>
  );
};
