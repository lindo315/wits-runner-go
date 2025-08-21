import { Package, User, BarChart3, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileBottomNavigation = ({ activeTab, onTabChange }: MobileBottomNavigationProps) => {
  const navItems = [
    { id: "available", icon: Package, label: "Orders" },
    { id: "earnings", icon: BarChart3, label: "Earnings" },
    { id: "notifications", icon: Bell, label: "Alerts" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || 
            (item.id === "available" && ["available", "active", "completed"].includes(activeTab));
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex-1 flex flex-col items-center py-2 px-1 min-h-[60px] transition-colors",
                isActive ? "text-primary" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};