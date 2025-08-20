import { ShoppingBag, CheckCircle2, Activity, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  availableCount?: number;
  activeCount?: number;
}

export function MobileBottomNav({ 
  activeTab, 
  onTabChange, 
  availableCount = 0, 
  activeCount = 0 
}: MobileBottomNavProps) {
  const tabs = [
    {
      id: "available",
      label: "Available",
      icon: ShoppingBag,
      count: availableCount
    },
    {
      id: "active", 
      label: "Active",
      icon: Activity,
      count: activeCount
    },
    {
      id: "completed",
      label: "Completed", 
      icon: CheckCircle2,
      count: 0
    },
    {
      id: "earnings",
      label: "Profile",
      icon: User,
      count: 0
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="grid grid-cols-4 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center space-y-1 relative transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/5' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {tab.count > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs"
                  >
                    {tab.count > 9 ? '9+' : tab.count}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}