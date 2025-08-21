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
  completedCount = 0 
}: MobileTabNavigationProps) => {
  const tabs = [
    { id: "available", label: "Available", count: availableCount },
    { id: "active", label: "Active", count: activeCount },
    { id: "completed", label: "Completed", count: completedCount },
    { id: "profile", label: "Profile", count: undefined },
  ];

  return (
    <div className="bg-white px-4 py-3 border-b">
      <div className="flex space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-red-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 text-xs">({tab.count})</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};