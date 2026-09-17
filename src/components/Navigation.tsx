import React from "react";
import { ViewTab } from "../types";
import {
  LayoutDashboard,
  CalendarClock,
  GraduationCap,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

interface NavigationProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  isHoliday: boolean;
  isFullHoliday: boolean;
  ongoingBatchCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  isHoliday,
  isFullHoliday,
  ongoingBatchCount,
}) => {
  const navItems = [
    {
      id: "dashboard" as ViewTab,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "schedule" as ViewTab,
      label: "Schedule",
      icon: CalendarClock,
      badge: isHoliday
        ? (isFullHoliday ? "Chutti" : "Partial")
        : ongoingBatchCount > 0
        ? `${ongoingBatchCount} Live`
        : undefined,
      badgeColor: isHoliday
        ? "bg-rose-500 text-white"
        : "bg-emerald-500 text-white animate-pulse",
    },
    {
      id: "workspace" as ViewTab,
      label: "Classes",
      icon: GraduationCap,
    },
    {
      id: "admin" as ViewTab,
      label: "Manage",
      icon: SlidersHorizontal,
    },
    {
      id: "assistant" as ViewTab,
      label: "AI Advisor",
      icon: Sparkles,
      badge: "Fast AI",
      badgeColor: "bg-indigo-600 text-white",
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 shadow-lg px-2 py-1 safe-bottom transition-all max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 min-h-[52px] py-1 px-1 sm:px-2 rounded-xl transition-all duration-150 active:scale-95 touch-manipulation cursor-pointer ${
                isActive
                  ? "text-slate-950 dark:text-white font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <div className="relative flex items-center justify-center">
                <div
                  className={`p-1 rounded-lg transition-colors ${
                    isActive ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" : ""
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-transform ${
                      isActive ? "scale-110 stroke-[2.2]" : "stroke-[1.8]"
                    }`}
                  />
                </div>

                {item.badge && (
                  <span
                    className={`absolute -top-1 -right-3 text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-0.5 tracking-tight whitespace-nowrap ${
                  isActive
                    ? "text-slate-900 dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <div className="w-4 h-1 bg-slate-900 dark:bg-slate-100 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

