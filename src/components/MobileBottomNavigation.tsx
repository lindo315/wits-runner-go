import { Package, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const MobileBottomNavigation = ({ activeTab, onTabChange }: MobileBottomNavigationProps) => {
  const navItems = [
    { id: "available", icon: Package, label: "Orders" },
    { id: "create", icon: Plus, label: "Create" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t pb-safe shadow-lg">
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === "available" && ["available", "active", "completed"].includes(activeTab));
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center py-2 px-4 min-w-0 flex-1",
                isActive ? "text-primary" : "text-gray-500"
              )}
            >
              <div className={cn(
                "p-2 rounded-full transition-colors",
                item.id === "create" && "bg-primary text-white"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};