import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  Scan,
  AlertTriangle,
  CalendarDays,
  BellRing,
  Bot,
  TrendingUp,
  BookOpen,
  Settings,
  LogOut,
  ChevronRight,
  X,
  Smartphone,
  Download
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, onClose, isMobile = false }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plants', label: 'My Plants', icon: Sprout },
    { id: 'scan', label: 'Scan Plant', icon: Scan, badge: 'AI' },
    { id: 'diagnose', label: 'Diagnose Disease', icon: AlertTriangle, badge: 'AI' },
    { id: 'reminders', label: 'Care Reminders', icon: BellRing },
    { id: 'calendar', label: 'Care Calendar', icon: CalendarDays },
    { id: 'chat', label: 'AI Plant Doctor', icon: Bot, badge: 'AI' },
    { id: 'growth', label: 'Growth Tracking', icon: TrendingUp },
    { id: 'learning', label: 'Learning Center', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={isMobile ? "flex flex-col w-full h-full bg-botanical-card dark:bg-botanical-darkCard z-30 transition-colors" : "hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-botanical-card dark:bg-botanical-darkCard border-r border-botanical-border dark:border-botanical-darkBorder flex-shrink-0 z-30 transition-colors"}>
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-botanical-border/60 dark:border-botanical-darkBorder/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-700 dark:bg-forest-800 flex items-center justify-center text-white shadow-soft">
            <span className="text-xl">🌿</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xl font-extrabold text-forest-800 dark:text-leaf-300 tracking-tight">FloraAI</h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-forest-100 dark:bg-forest-900/80 text-forest-700 dark:text-leaf-400">PRO</span>
            </div>
            <p className="text-xs text-botanical-muted dark:text-botanical-darkMuted">Botanical Care Assistant</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-botanical-muted hover:text-forest-700 hover:bg-forest-50 dark:hover:bg-forest-950/50 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-forest-700 text-white shadow-sm font-semibold'
                  : 'text-botanical-text dark:text-botanical-darkText hover:bg-forest-50/80 dark:hover:bg-forest-950/40 hover:text-forest-700 dark:hover:text-leaf-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-leaf-300' : 'text-botanical-muted dark:text-botanical-darkMuted group-hover:text-forest-700 dark:group-hover:text-leaf-300'}`} />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                    isActive ? 'bg-forest-800 text-leaf-300' : 'bg-forest-100 dark:bg-forest-900/50 text-forest-700 dark:text-leaf-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Mobile App Direct Download Banner */}
      <div className="px-3 pb-3">
        <a
          href="/FloraAI.apk"
          download="FloraAI.apk"
          className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-forest-800 to-forest-900 text-white shadow-soft hover:shadow-card hover:scale-[1.01] transition-all group"
          title="Direct Download FloraAI Android APK to Phone"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-leaf-300">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Android App</p>
              <p className="text-[10px] text-leaf-200/80">Direct Download (.apk)</p>
            </div>
          </div>
          <Download className="w-4 h-4 text-leaf-300 group-hover:translate-y-0.5 transition-transform" />
        </a>
      </div>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-botanical-border/60 dark:border-botanical-darkBorder/60 bg-forest-50/30 dark:bg-forest-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-forest-200 dark:bg-forest-800 flex items-center justify-center font-bold text-forest-800 dark:text-leaf-300 overflow-hidden flex-shrink-0">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
              ) : (
                user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'F'
              )}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-forest-900 dark:text-leaf-200 truncate">{user?.full_name || 'Gardener'}</p>
              <p className="text-[11px] text-botanical-muted dark:text-botanical-darkMuted truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-botanical-muted hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
