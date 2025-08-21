import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Zap, ArrowRightCircle, CheckCircle2, User } from "lucide-react";

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
  completedCount = 0 
}: MobileTabNavigationProps) => {
  const tabs = [
    { 
      id: "available", 
      label: "Available", 
      count: availableCount,
      icon: Zap,
      color: "from-green-500 to-emerald-600",
      activeColor: "bg-green-500"
    },
    { 
      id: "active", 
      label: "Active", 
      count: activeCount,
      icon: ArrowRightCircle,
      color: "from-blue-500 to-blue-600",
      activeColor: "bg-blue-500"
    },
    { 
      id: "completed", 
      label: "Completed", 
      count: completedCount,
      icon: CheckCircle2,
      color: "from-purple-500 to-purple-600",
      activeColor: "bg-purple-500"
    },
    { 
      id: "earnings", 
      label: "Earnings", 
      count: undefined,
      icon: User,
      color: "from-orange-500 to-orange-600",
      activeColor: "bg-orange-500"
    },
  ];

  return (
    <div className="sticky top-0 z-40 bg-white px-3 py-4 border-b border-gray-100 shadow-sm">
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 whitespace-nowrap min-w-fit",
                isActive
                  ? `${tab.activeColor} text-white shadow-lg transform scale-105`
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-800"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "ml-1 text-xs h-5 px-1.5",
                    isActive ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  )}
                >
                  {tab.count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};