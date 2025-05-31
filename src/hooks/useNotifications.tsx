
import { useState, useEffect } from 'react';
import { notificationService, NotificationPreferences } from '@/services/notificationService';
import { useToast } from '@/hooks/use-toast';

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({ enabled: false, soundEnabled: true });
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported(notificationService.isSupported());
    setPermission(notificationService.getPermissionStatus());
    setPreferences(notificationService.getPreferences());

    // Register service worker on mount
    if (notificationService.isSupported()) {
      notificationService.registerServiceWorker().catch((error) => {
        console.error('Failed to register service worker:', error);
      });
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const newPermission = await notificationService.requestPermission();
      setPermission(newPermission);
      
      if (newPermission === 'granted') {
        const newPreferences = { ...preferences, enabled: true };
        setPreferences(newPreferences);
        notificationService.savePreferences(newPreferences);
        
        toast({
          title: "Notifications Enabled",
          description: "You'll now receive order notifications.",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast({
        title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);
    notificationService.savePreferences(updated);
  };

  const sendTestNotification = async () => {
    if (permission !== 'granted') {
      toast({
        title: "Permission Required",
        description: "Please enable notifications first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await notificationService.sendTestNotification();
      toast({
        title: "Test Sent",
        description: "Check if you received the test notification.",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  const showOrderNotification = async (orderId: string, customerName: string) => {
    await notificationService.showNotification(
      'New Order!',
      `Order #${orderId} from ${customerName}`,
      `order-${orderId}`
    );
  };

  return {
    permission,
    preferences,
    isSupported,
    isLoading,
    requestPermission,
    updatePreferences,
    sendTestNotification,
    showOrderNotification,
  };
};
