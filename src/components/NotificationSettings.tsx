
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, Volume2, VolumeX, TestTube, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationSettings = () => {
  const {
    preferences,
    isSupported,
    isLoading,
    updatePreferences,
    requestPermission,
    sendTestNotification
  } = useNotifications();

  const getStatusBadge = () => {
    if (!isSupported) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        Not Supported
      </Badge>;
    }

    switch (preferences.permission) {
      case 'granted':
        return <Badge variant={preferences.enabled ? "default" : "secondary"} className="flex items-center gap-1">
          {preferences.enabled ? <Bell className="h-3 w-3" /> : <BellOff className="h-3 w-3" />}
          {preferences.enabled ? 'Enabled' : 'Disabled'}
        </Badge>;
      case 'denied':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <BellOff className="h-3 w-3" />
          Blocked
        </Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1">
          <Bell className="h-3 w-3" />
          Permission Required
        </Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isSupported ? (
          <div className="text-center py-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              Your browser doesn't support notifications
            </p>
          </div>
        ) : (
          <>
            {preferences.permission !== 'granted' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Enable browser notifications to receive alerts for new orders
                </p>
                <Button 
                  onClick={requestPermission} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Bell className="h-4 w-4 mr-2" />
                  {isLoading ? 'Requesting...' : 'Enable Order Notifications'}
                </Button>
              </div>
            )}

            {preferences.permission === 'granted' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications-enabled" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Enable Notifications
                  </Label>
                  <Switch
                    id="notifications-enabled"
                    checked={preferences.enabled}
                    onCheckedChange={(enabled) => updatePreferences({ enabled })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled" className="flex items-center gap-2">
                    {preferences.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                    Enable Sound
                  </Label>
                  <Switch
                    id="sound-enabled"
                    checked={preferences.soundEnabled}
                    onCheckedChange={(soundEnabled) => updatePreferences({ soundEnabled })}
                  />
                </div>

                <Button 
                  variant="outline" 
                  onClick={sendTestNotification}
                  className="w-full"
                  disabled={!preferences.enabled}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Send Test Notification
                </Button>
              </div>
            )}

            {preferences.permission === 'denied' && (
              <div className="text-center py-4 space-y-2">
                <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
