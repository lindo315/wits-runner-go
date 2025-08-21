import {
  Package,
  User,
  BarChart3,
  Bell,
  Home,
  Sparkles,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileBottomNavigation = ({
  activeTab,
  onTabChange,
}: MobileBottomNavigationProps) => {
  const navItems = [
    {
      id: "available",
      icon: Home,
      label: "Home",
      description: "Dashboard",
      color: "from-orange-500 to-amber-500",
      bgColor: "from-orange-50 to-amber-50",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    {
      id: "earnings",
      icon: BarChart3,
      label: "Earnings",
      description: "Income",
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      id: "profile",
      icon: User,
      label: "Profile",
      description: "Account",
      color: "from-purple-500 to-violet-500",
      bgColor: "from-purple-50 to-violet-50",
      borderColor: "border-purple-200",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <nav className="mobile-bottom-nav">
      <div className="px-3 py-2">
        {/* Quick Stats Bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
              <span>Online</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-orange-500" />
              <span>2 Active</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
            <Sparkles className="h-3 w-3 animate-pulse" />
            <span>Live</span>
          </div>
        </div>

        {/* Enhanced Navigation */}
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              activeTab === item.id ||
              (item.id === "available" &&
                ["available", "active", "completed", "notifications"].includes(
                  activeTab
                ));

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-300 relative overflow-hidden mobile-tap-target mobile-no-select border",
                  isActive
                    ? `bg-gradient-to-br ${item.bgColor} ${item.borderColor} shadow-md`
                    : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r",
                      item.color
                    )}
                  />
                )}

                {/* Icon with enhanced styling */}
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-300 relative",
                    isActive
                      ? `bg-gradient-to-br ${item.color} shadow-md`
                      : item.iconBg
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-all duration-300",
                      isActive ? "text-white" : item.iconColor
                    )}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "text-xs font-semibold transition-all duration-300",
                      isActive ? "text-gray-900" : "text-gray-600"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};