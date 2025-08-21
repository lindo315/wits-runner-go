import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
      count: availableCount
    },
    { 
      id: "active", 
      label: "Active", 
      count: activeCount
    },
    { 
      id: "completed", 
      label: "Completed", 
      count: completedCount
    },
    { 
      id: "earnings", 
      label: "Earnings", 
      count: undefined
    },
  ];

  return (
    <div className="sticky top-16 z-40 bg-white border-b border-gray-200">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 min-w-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                isActive
                  ? "text-primary border-primary bg-primary/5"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="h-5 px-1.5 text-xs bg-gray-100 text-gray-700"
                  >
                    {tab.count}
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};