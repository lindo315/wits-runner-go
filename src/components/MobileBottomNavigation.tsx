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
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg pb-safe">
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
                "flex-1 flex flex-col items-center py-3 px-1 min-h-[64px] transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/8" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
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