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
      <div className="px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onMenuClick && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuClick}
                className="h-12 w-12 rounded-2xl hover:bg-orange-50 hover:text-orange-600 mobile-tap-target transition-all duration-300"
              >
                <Menu className="h-6 w-6" />
              </Button>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                  {title}
                </h1>
                <div className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Live</span>
                </div>
              </div>

              {showAvailabilityToggle && (
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300 shadow-sm",
                      isAvailable
                        ? "bg-gradient-to-r from-green-400 to-green-500 animate-pulse"
                        : "bg-gray-400"
                    )}
                  />
                  <span
                    className={cn(
                      "text-sm font-medium transition-colors duration-300 truncate",
                      isAvailable ? "text-green-700" : "text-gray-600"
                    )}
                  >
                    {isAvailable ? "Available for Orders" : "Currently Offline"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {showAvailabilityToggle && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl px-4 py-2 border border-orange-200 shadow-sm">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-semibold text-orange-700">
                    Status
                  </span>
                  <span className="text-xs text-orange-600">
                    {isAvailable ? "Online" : "Offline"}
                  </span>
                </div>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={onAvailabilityChange}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-green-600"
                />
              </div>
            )}

            {/* Enhanced Notification Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationClick}
              className="relative h-12 w-12 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all duration-300 mobile-tap-target"
            >
              <Bell className="h-6 w-6" />
              {hasNotifications && (
                <Badge className="absolute -top-1 -right-1 h-6 w-6 p-0 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs flex items-center justify-center rounded-full animate-bounce shadow-lg border-2 border-white">
                  3
                </Badge>
              )}
            </Button>

            {/* Quick Stats */}
            <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl px-3 py-2 border border-blue-200">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div className="text-right">
                <div className="text-xs font-semibold text-blue-700">Today</div>
                <div className="text-xs text-blue-600">+12%</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};
