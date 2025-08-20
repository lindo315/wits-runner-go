import { 
  ShoppingBag, 
  ArrowRightCircle, 
  CheckCircle2, 
  User 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  activeOrdersCount?: number;
  availableOrdersCount?: number;
}

export const MobileBottomNav = ({
  activeTab,
  onTabChange,
  activeOrdersCount = 0,
  availableOrdersCount = 0
}: MobileBottomNavProps) => {
  const navigate = useNavigate();

  const tabs = [
    {
      id: "available",
      label: "Available",
      icon: ShoppingBag,
      count: availableOrdersCount
    },
    {
      id: "active", 
      label: "Active",
      icon: ArrowRightCircle,
      count: activeOrdersCount
    },
    {
      id: "completed",
      label: "Completed", 
      icon: CheckCircle2
    },
    {
      id: "profile",
      label: "Profile",
      icon: User
    }
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === "profile") {
      navigate("/profile");
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border px-2 py-2 z-50">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <Button
              key={tab.id}
              variant="ghost"
              size="sm"
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "flex flex-col items-center space-y-1 h-auto py-2 px-3 relative",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {tab.count && tab.count > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center p-0 text-xs bg-primary text-primary-foreground"
                  >
                    {tab.count > 9 ? '9+' : tab.count}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{tab.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};