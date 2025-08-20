import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileTopNavProps {
  isAvailable: boolean;
  onAvailabilityChange: (available: boolean) => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export function MobileTopNav({ 
  isAvailable, 
  onAvailabilityChange, 
  notificationCount = 0,
  onNotificationClick 
}: MobileTopNavProps) {
  return (
    <header className="md:hidden sticky top-0 z-50 bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="availability-mobile"
              checked={isAvailable}
              onCheckedChange={onAvailabilityChange}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${isAvailable ? 'text-primary' : 'text-muted-foreground'}`}>
              {isAvailable ? 'Available' : 'Offline'}
            </span>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="relative"
          onClick={onNotificationClick}
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}