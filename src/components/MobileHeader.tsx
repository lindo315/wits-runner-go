import {
  Bell,
  Settings,
  Menu,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MobileHeaderProps {
  title: string;
  onNotificationClick: () => void;
  hasNotifications?: boolean;
  showAvailabilityToggle?: boolean;
  isAvailable?: boolean;
  onAvailabilityChange?: (available: boolean) => void;
  onMenuClick?: () => void;
}

export const MobileHeader = ({
  title,
  onNotificationClick,
  hasNotifications = false,
  showAvailabilityToggle = false,
  isAvailable = false,
  onAvailabilityChange,
  onMenuClick,
}: MobileHeaderProps) => {
  return (
    <header className="mobile-header">
      {/* Main Header */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="h-8 w-8 rounded-lg hover:bg-orange-50 hover:text-orange-600 mobile-tap-target transition-all duration-300"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>

              {showAvailabilityToggle && (
                <div className="flex items-center gap-1 mt-1">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      isAvailable
                        ? "bg-gradient-to-r from-green-400 to-green-500 animate-pulse"
                        : "bg-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors duration-300 truncate",
                      isAvailable ? "text-green-700" : "text-gray-600"
                    )}
                  >
                    {isAvailable ? "Available" : "Offline"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {showAvailabilityToggle && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg px-2 py-1 border border-orange-200">
                <Switch
                  checked={isAvailable}
                  onCheckedChange={onAvailabilityChange}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600 scale-75"
                />
                <span className="text-xs text-orange-600">
                  {isAvailable ? "On" : "Off"}
                </span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationClick}
              className="relative h-8 w-8 rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 mobile-tap-target"
            >
              <Bell className="h-4 w-4" />
              {hasNotifications && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs flex items-center justify-center rounded-full animate-bounce shadow-lg border border-white">
                  3
                </Badge>
              )}
            </Button>
          </div>
        </div>

      </div>
    </header>
  );
};
