
import { supabase } from "@/integrations/supabase/client";

export interface OrderEmailData {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  orderTimestamp: string;
  priority?: 'normal' | 'high' | 'urgent';
  specialInstructions?: string;
}

export interface EmailNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  retryCount?: number;
}

class EmailNotificationService {
  private static instance: EmailNotificationService;

  private constructor() {}

  static getInstance(): EmailNotificationService {
    if (!EmailNotificationService.instance) {
      EmailNotificationService.instance = new EmailNotificationService();
    }
    return EmailNotificationService.instance;
  }

  async sendOrderNotification(orderData: OrderEmailData): Promise<EmailNotificationResult> {
    try {
      console.log('Sending order notification email for order:', orderData.orderNumber);

      const { data, error } = await supabase.functions.invoke('send-order-notification', {
        body: orderData,
      });

      if (error) {
        console.error('Supabase function error:', error);
        return {
          success: false,
          error: error.message || 'Failed to invoke email function',
        };
      }

      if (data?.error) {
        console.error('Email sending error:', data.error);
        return {
          success: false,
          error: data.error,
          retryCount: data.retryCount,
        };
      }

      console.log('Email notification sent successfully:', data);
      return {
        success: true,
        messageId: data.messageId,
      };

    } catch (error) {
      console.error('Unexpected error sending email notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async logEmailStatus(orderId: string, status: 'sent' | 'failed', error?: string, messageId?: string): Promise<void> {
    try {
      const { error: logError } = await supabase
        .from('email_notifications')
        .insert({
          order_id: orderId,
          notification_type: 'order_notification',
          recipient_email: 'delivery_team', // We don't store the actual email for privacy
          status: status,
          error_message: error,
          body_text: `Order notification for order ${orderId}`,
          subject: `New Order Notification`,
        });

      if (logError) {
        console.error('Failed to log email status:', logError);
      }
    } catch (err) {
      console.error('Error logging email status:', err);
    }
  }
}

export const emailNotificationService = EmailNotificationService.getInstance();
