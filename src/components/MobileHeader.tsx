import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
    <div className="bg-gradient-to-r from-primary to-blue-600 text-white pt-safe">
      {/* Main Header */}
      <header className="px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{title}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNotificationClick}
          className="text-white hover:bg-white/10 relative"
        >
          <Bell className="h-5 w-5" />
          {hasNotifications && (
            <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </Button>
      </header>
      
      {/* Availability Toggle */}
      {showAvailabilityToggle && (
        <div className="px-4 pb-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
              <Label htmlFor="availability" className="text-white font-medium">
                {isAvailable ? "Available for orders" : "Currently unavailable"}
              </Label>
            </div>
            <Switch
              id="availability"
              checked={isAvailable}
              onCheckedChange={onAvailabilityChange}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};