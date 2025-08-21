import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  title: string;
  onNotificationClick: () => void;
  hasNotifications?: boolean;
}

export const MobileHeader = ({ title, onNotificationClick, hasNotifications = false }: MobileHeaderProps) => {
  return (
    <header className="bg-black text-white px-4 py-3 pt-safe flex items-center justify-between">
      <h1 className="text-xl font-semibold">{title}</h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNotificationClick}
        className="text-white hover:bg-white/10 relative"
      >
        <Bell className="h-5 w-5" />
        {hasNotifications && (
          <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
        )}
      </Button>
    </header>
  );
};