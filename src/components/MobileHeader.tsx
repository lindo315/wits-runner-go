import { Bell, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface MobileHeaderProps {
  title: string;
  onNotificationClick: () => void;
  hasNotifications?: boolean;
  showAvailabilityToggle?: boolean;
  isAvailable?: boolean;
  onAvailabilityChange?: (available: boolean) => void;
}

export const MobileHeader = ({ 
  title, 
  onNotificationClick, 
  hasNotifications = false,
  showAvailabilityToggle = false,
  isAvailable = false,
  onAvailabilityChange
}: MobileHeaderProps) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 pt-safe">
      {/* Main Header */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          {showAvailabilityToggle && (
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="text-sm text-gray-600">
                {isAvailable ? "Available" : "Offline"}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {showAvailabilityToggle && (
            <Switch
              checked={isAvailable}
              onCheckedChange={onAvailabilityChange}
              className="data-[state=checked]:bg-green-500"
            />
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onNotificationClick}
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {hasNotifications && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                3
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};