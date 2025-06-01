
import { useState } from 'react';
import { emailNotificationService, OrderEmailData, EmailNotificationResult } from '@/services/emailNotificationService';
import { useToast } from '@/hooks/use-toast';

export const useOrderEmailNotifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendOrderNotification = async (orderData: OrderEmailData): Promise<EmailNotificationResult> => {
    setIsLoading(true);
    
    try {
      console.log('Initiating email notification for order:', orderData.orderNumber);
      
      const result = await emailNotificationService.sendOrderNotification(orderData);
      
      // Log the email status
      await emailNotificationService.logEmailStatus(
        orderData.orderId,
        result.success ? 'sent' : 'failed',
        result.error,
        result.messageId
      );

      if (result.success) {
        console.log('Order notification sent successfully');
        toast({
          title: "✅ Delivery Team Notified",
          description: `Email notification sent for order #${orderData.orderNumber}. The delivery team has been alerted and will process your order shortly.`,
          duration: 5000,
        });
      } else {
        console.error('Failed to send order notification:', result.error);
        toast({
          title: "⚠️ Notification Warning",
          description: `Order placed successfully, but we couldn't notify the delivery team via email. We'll contact them directly. Order #${orderData.orderNumber}`,
          variant: "destructive",
          duration: 7000,
        });
      }

      return result;
    } catch (error) {
      console.error('Unexpected error in sendOrderNotification:', error);
      
      await emailNotificationService.logEmailStatus(
        orderData.orderId,
        'failed',
        error instanceof Error ? error.message : 'Unknown error'
      );

      toast({
        title: "❌ Notification Failed",
        description: `Order placed successfully, but notification failed. We'll contact the delivery team manually. Order #${orderData.orderNumber}`,
        variant: "destructive",
        duration: 7000,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendOrderNotification,
    isLoading,
  };
};
