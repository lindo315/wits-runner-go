import {
  Package,
  CheckCircle2,
  ArrowRightCircle,
  Zap,
  Bell,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileTabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableCount?: number;
  activeCount?: number;
  completedCount?: number;
}

export const MobileTabNavigation = ({
  activeTab,
  onTabChange,
  availableCount = 0,
  activeCount = 0,
  completedCount = 0,
}: MobileTabNavigationProps) => {
  const tabs = [
    {
      id: "available",
      label: "Available",
      icon: Zap,
      count: availableCount,
      color: "from-orange-500 to-amber-500",
      bgColor: "from-orange-50 to-amber-50",
      textColor: "text-orange-700",
      borderColor: "border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      description: "New orders",
    },
    {
      id: "active",
      label: "Active",
      icon: ArrowRightCircle,
      count: activeCount,
      color: "from-blue-500 to-indigo-500",
      bgColor: "from-blue-50 to-indigo-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      description: "In progress",
    },
    {
      id: "completed",
      label: "Completed",
      icon: CheckCircle2,
      count: completedCount,
      color: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      description: "Delivered",
    },
  ];

  return (
    <div className="mobile-tab-nav">
      <div className="px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-100 rounded-xl">
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Order Management</h3>
              <p className="text-xs text-gray-500">Track your deliveries</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>Live</span>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden mobile-tap-target mobile-no-select border-2",
                  isActive
                    ? `bg-gradient-to-br ${tab.bgColor} ${tab.borderColor} shadow-lg transform scale-105`
                    : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                      tab.color
                    )}
                  />
                )}

                {/* Icon with enhanced styling */}
                <div
                  className={cn(
                    "p-3 rounded-2xl transition-all duration-300 relative",
                    isActive
                      ? `bg-gradient-to-br ${tab.color} shadow-lg`
                      : tab.iconBg
                  )}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 transition-all duration-300",
                      isActive ? "text-white" : tab.iconColor
                    )}
                  />

                  {/* Pulse effect for active tab */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent animate-pulse" />
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "text-sm font-bold transition-all duration-300",
                      isActive ? tab.textColor : "text-gray-700"
                    )}
                  >
                    {tab.label}
                  </span>
                  <span
                    className={cn(
                      "text-xs transition-all duration-300",
                      isActive ? "text-gray-600" : "text-gray-500"
                    )}
                  >
                    {tab.description}
                  </span>
                </div>

                {/* Enhanced Count Badge */}
                {tab.count > 0 && (
                  <div
                    className={cn(
                      "absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-lg",
                      isActive
                        ? `bg-gradient-to-br ${tab.color} text-white animate-bounce`
                        : "bg-gray-200 text-gray-700"
                    )}
                  >
                    {tab.count > 99 ? "99+" : tab.count}
                  </div>
                )}

                {/* Hover effect overlay */}
                {!isActive && (
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Stats Row */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span>Available: {availableCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>Active: {activeCount}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Completed: {completedCount}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>+12% today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
