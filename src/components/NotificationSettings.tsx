
import React from 'react';
import { Bell, BellOff, AlertCircle, Volume2, VolumeX, TestTube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationSettings = () => {
  const {
    permission,
    preferences,
    isSupported,
    isLoading,
    requestPermission,
    updatePreferences,
    sendTestNotification,
  } = useNotifications();

  const getPermissionStatus = () => {
    if (!isSupported) {
      return { icon: AlertCircle, text: 'Not Supported', variant: 'destructive' as const };
    }
    
    switch (permission) {
      case 'granted':
        return { icon: Bell, text: 'Enabled', variant: 'default' as const };
      case 'denied':
        return { icon: BellOff, text: 'Denied', variant: 'destructive' as const };
      default:
        return { icon: AlertCircle, text: 'Not Set', variant: 'secondary' as const };
    }
  };

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Order Notifications
        </CardTitle>
        <CardDescription>
          Get notified when new orders are available for delivery
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Permission Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Status:</span>
          </div>
          <Badge variant={status.variant}>
            {status.text}
          </Badge>
        </div>

        {/* Enable Notifications Button */}
        {permission !== 'granted' && isSupported && (
          <Button 
            onClick={requestPermission} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Requesting...' : 'Enable Order Notifications'}
          </Button>
        )}

        {/* Permission Denied Message */}
        {permission === 'denied' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              Notifications are blocked. Please enable them in your browser settings and refresh the page.
            </p>
          </div>
        )}

        {/* Not Supported Message */}
        {!isSupported && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              Your browser doesn't support push notifications.
            </p>
          </div>
        )}

        {/* Settings (only show if permission is granted) */}
        {permission === 'granted' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">Enable Notifications</span>
              </div>
              <Switch
                checked={preferences.enabled}
                onCheckedChange={(enabled) => updatePreferences({ enabled })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {preferences.soundEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">Notification Sound</span>
              </div>
              <Switch
                checked={preferences.soundEnabled}
                onCheckedChange={(soundEnabled) => updatePreferences({ soundEnabled })}
                disabled={!preferences.enabled}
              />
            </div>

            <Button 
              variant="outline" 
              onClick={sendTestNotification}
              disabled={!preferences.enabled}
              className="w-full"
            >
              <TestTube className="h-4 w-4 mr-2" />
              Send Test Notification
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
