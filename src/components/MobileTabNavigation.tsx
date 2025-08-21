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
      <div className="px-3 py-2">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-orange-100 rounded-lg">
              <Package className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Orders</h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
            <Sparkles className="h-3 w-3" />
            <span>Live</span>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 relative overflow-hidden mobile-tap-target mobile-no-select border",
                  isActive
                    ? `bg-gradient-to-br ${tab.bgColor} ${tab.borderColor} shadow-md`
                    : "bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r",
                      tab.color
                    )}
                  />
                )}

                {/* Icon with enhanced styling */}
                <div
                  className={cn(
                    "p-1.5 rounded-lg transition-all duration-300 relative",
                    isActive
                      ? `bg-gradient-to-br ${tab.color} shadow-md`
                      : tab.iconBg
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-all duration-300",
                      isActive ? "text-white" : tab.iconColor
                    )}
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "text-xs font-semibold transition-all duration-300",
                      isActive ? tab.textColor : "text-gray-700"
                    )}
                  >
                    {tab.label}
                  </span>
                </div>

                {/* Enhanced Count Badge */}
                {tab.count > 0 && (
                  <div
                    className={cn(
                      "absolute -top-1 -right-1 h-4 w-4 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-md",
                      isActive
                        ? `bg-gradient-to-br ${tab.color} text-white`
                        : "bg-gray-200 text-gray-700"
                    )}
                  >
                    {tab.count > 9 ? "9+" : tab.count}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
