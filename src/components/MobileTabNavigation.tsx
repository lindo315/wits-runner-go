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
  ];

  return (
    <div className="sticky top-16 z-40 bg-white shadow-sm">
      <div className="flex px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex-1 px-3 py-4 text-sm font-semibold border-b-2 transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "text-primary border-primary bg-primary/8"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <span>{tab.label}</span>
                 {tab.count !== undefined && tab.count > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="h-5 px-1.5 text-xs bg-primary/10 text-primary border-primary/20"
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