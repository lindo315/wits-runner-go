
import { useState, useEffect, useCallback } from 'react';
import { notificationService, NotificationPreferences } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    notificationService.getPreferences()
  );
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    
    // Register service worker on mount
    if (notificationService.isSupported()) {
      notificationService.registerServiceWorker();
    }
  }, []);

  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    notificationService.savePreferences(updated);
  }, [preferences]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const permission = await notificationService.requestPermission();
      
      if (permission === 'granted') {
        updatePreferences({ permission, enabled: true });
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive notifications for new orders"
        });
      } else if (permission === 'denied') {
        updatePreferences({ permission, enabled: false });
        toast({
          title: "Notifications Blocked",
          description: "Please enable notifications in your browser settings",
          variant: "destructive"
        });
      } else {
        updatePreferences({ permission, enabled: false });
        toast({
          title: "Permission Required",
          description: "Please allow notifications to receive order alerts",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, updatePreferences, toast]);

  const sendTestNotification = useCallback(async () => {
    try {
      await notificationService.sendTestNotification();
      toast({
        title: "Test Sent",
        description: "Check if you received the test notification"
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification",
        variant: "destructive"
      });
    }
  }, [toast]);

  const showOrderNotification = useCallback(async (orderNumber: string, customerName: string, isUrgent: boolean = false) => {
    await notificationService.showOrderNotification(orderNumber, customerName, isUrgent);
  }, []);

  return {
    preferences,
    isSupported,
    isLoading,
    updatePreferences,
    requestPermission,
    sendTestNotification,
    showOrderNotification
  };
};
