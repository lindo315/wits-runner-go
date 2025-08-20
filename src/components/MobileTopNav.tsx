import { Bell, Activity } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileTopNavProps {
  isAvailable: boolean;
  onAvailabilityChange: (available: boolean) => void;
  notificationCount?: number;
  onNotificationClick: () => void;
}

export const MobileTopNav = ({
  isAvailable,
  onAvailabilityChange,
  notificationCount = 0,
  onNotificationClick
}: MobileTopNavProps) => {
  return (
    <div className="bg-background border-b border-border p-4 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Active Toggle */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="availability"
              checked={isAvailable}
              onCheckedChange={onAvailabilityChange}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="availability" className="text-sm font-medium flex items-center space-x-2">
              <Activity className={`h-4 w-4 ${isAvailable ? 'text-primary' : 'text-muted-foreground'}`} />
              <span>{isAvailable ? 'Available' : 'Offline'}</span>
            </Label>
          </div>
          {isAvailable && (
            <Badge className="bg-primary/10 text-primary border-primary/20">
              Online
            </Badge>
          )}
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onNotificationClick}
          className="relative p-2"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-destructive text-destructive-foreground"
            >
              {notificationCount > 9 ? '9+' : notificationCount}
            </Badge>
          )}
        </Button>
      </div>
    </div>
  );
};