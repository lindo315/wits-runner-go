
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderCancellationNotifications = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    // Listen to order updates for cancelled orders
    const channel = supabase
      .channel('order-cancellations')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `customer_id=eq.${currentUser.id}`
        },
        (payload) => {
          const updatedOrder = payload.new;
          const oldOrder = payload.old;
          
          // Check if order was just cancelled due to timeout
          if (
            updatedOrder.status === 'cancelled' && 
            oldOrder.status === 'pending' &&
            updatedOrder.cancellation_reason === 'Order not accepted within 15 minutes'
          ) {
            toast({
              title: "⏰ Order Cancelled",
              description: `Your order #${updatedOrder.order_number} was automatically cancelled because no runner accepted it within 15 minutes. Please try placing your order again.`,
              variant: "destructive",
              duration: 10000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, toast]);
};
