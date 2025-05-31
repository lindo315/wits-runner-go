
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, BellOff } from 'lucide-react';
import { notificationService, OrderAlert } from '@/services/notificationService';

const NotificationBadge = () => {
  const [alerts, setAlerts] = useState<OrderAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToAlerts((newAlerts) => {
      setAlerts(newAlerts);
      setUnreadCount(newAlerts.filter(alert => !alert.seen).length);
    });

    // Initialize with current alerts
    setAlerts(notificationService.getAlerts());
    setUnreadCount(notificationService.getUnreadCount());

    return unsubscribe;
  }, []);

  const handleMarkAllAsSeen = () => {
    notificationService.markAllAsSeen();
  };

  if (unreadCount === 0) {
    return (
      <Button variant="ghost" size="sm" className="relative">
        <BellOff className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="relative"
      onClick={handleMarkAllAsSeen}
    >
      <Bell className="h-5 w-5" />
      <Badge 
        variant="destructive" 
        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
      >
        {unreadCount > 99 ? '99+' : unreadCount}
      </Badge>
    </Button>
  );
};

export default NotificationBadge;
