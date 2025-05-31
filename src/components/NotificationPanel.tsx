
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, User, CheckCheck } from 'lucide-react';
import { notificationService, OrderAlert } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel = () => {
  const [alerts, setAlerts] = useState<OrderAlert[]>([]);
  const [lastOrderTime, setLastOrderTime] = useState<Date | null>(null);

  useEffect(() => {
    const unsubscribe = notificationService.subscribeToAlerts((newAlerts) => {
      setAlerts(newAlerts);
      setLastOrderTime(notificationService.getLastOrderTime());
    });

    // Initialize with current alerts
    setAlerts(notificationService.getAlerts());
    setLastOrderTime(notificationService.getLastOrderTime());

    return unsubscribe;
  }, []);

  const handleMarkAllAsSeen = () => {
    notificationService.markAllAsSeen();
  };

  const unreadCount = alerts.filter(alert => !alert.seen).length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Order Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMarkAllAsSeen}
              className="flex items-center gap-1"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as seen
            </Button>
          )}
        </div>
        {lastOrderTime && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Last order: {formatDistanceToNow(lastOrderTime, { addSuffix: true })}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {alerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  alert.seen 
                    ? 'bg-muted/50 border-border' 
                    : alert.isUrgent
                    ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                    : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Order #{alert.orderNumber}</span>
                    {alert.isUrgent && (
                      <Badge variant="destructive" className="text-xs">
                        URGENT
                      </Badge>
                    )}
                    {!alert.seen && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    {alert.customerName}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationPanel;
