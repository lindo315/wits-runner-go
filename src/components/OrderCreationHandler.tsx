
import React from 'react';
import { useOrderEmailNotifications } from '@/hooks/useOrderEmailNotifications';
import { formatOrderForEmail } from '@/utils/orderEmailFormatter';
import { supabase } from '@/integrations/supabase/client';

interface OrderCreationHandlerProps {
  onOrderCreated?: (orderId: string) => void;
  children: React.ReactNode;
}

export const OrderCreationHandler: React.FC<OrderCreationHandlerProps> = ({ 
  onOrderCreated, 
  children 
}) => {
  const { sendOrderNotification, isLoading: isNotificationLoading } = useOrderEmailNotifications();

  const handleOrderCreation = async (orderData: any): Promise<string | null> => {
    try {
      console.log('Creating order:', orderData);

      // First, save the order to Supabase
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select(`
          *,
          order_items(*,
            menu_item:menu_items(*)
          )
        `)
        .single();

      if (orderError) {
        console.error('Failed to create order:', orderError);
        throw new Error('Failed to create order: ' + orderError.message);
      }

      console.log('Order created successfully:', order);

      // Format order data for email
      const emailData = formatOrderForEmail(order);

      // Send email notification (don't block order creation if this fails)
      try {
        await sendOrderNotification(emailData);
      } catch (emailError) {
        console.error('Email notification failed, but order was created:', emailError);
        // Continue - the order was successful even if email failed
      }

      // Call the success callback
      if (onOrderCreated) {
        onOrderCreated(order.id);
      }

      return order.id;

    } catch (error) {
      console.error('Error in order creation process:', error);
      throw error;
    }
  };

  // Provide the order creation handler to children
  return (
    <>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onCreateOrder: handleOrderCreation,
            isCreatingOrder: isNotificationLoading,
          } as any);
        }
        return child;
      })}
    </>
  );
};

export default OrderCreationHandler;
