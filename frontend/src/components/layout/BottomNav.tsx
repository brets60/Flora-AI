import React from 'react';
import { LayoutDashboard, Sprout, Scan, BellRing, Bot } from 'lucide-react';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const items = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'plants', label: 'Garden', icon: Sprout },
    { id: 'scan', label: 'Scan', icon: Scan, isSpecial: true },
    { id: 'reminders', label: 'Care', icon: BellRing },
    { id: 'chat', label: 'Doctor', icon: Bot },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-botanical-card/95 dark:bg-botanical-darkCard/95 backdrop-blur-lg border-t border-botanical-border dark:border-botanical-darkBorder px-2 py-2 flex items-center justify-around shadow-elevated safe-bottom">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = currentTab === item.id;

        if (item.isSpecial) {
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center -mt-6 group focus:outline-none"
              aria-label={item.label}
            >
              <div className="w-13 h-13 rounded-full bg-forest-700 dark:bg-forest-600 text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border-4 border-botanical-bg dark:border-botanical-darkBg">
                <Icon className="w-6 h-6 text-leaf-300" />
              </div>
              <span className="text-[10px] font-bold mt-1 text-forest-800 dark:text-leaf-300">
                {item.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center py-1 px-3 rounded-xl transition-colors ${
              isActive
                ? 'text-forest-700 dark:text-leaf-300 font-bold'
                : 'text-botanical-muted dark:text-botanical-darkMuted hover:text-forest-700'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] mt-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
