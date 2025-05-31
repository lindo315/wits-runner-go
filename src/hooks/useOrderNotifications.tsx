
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderNotifications = () => {
  const { showOrderNotification } = useNotifications();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    console.log('Setting up order notifications subscription');

    // Subscribe to new orders
    const channel = supabase
      .channel('order-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('New order detected:', payload);
          
          const order = payload.new;
          
          // Only notify for orders that are ready or pending (available for runners)
          if (order.status === 'ready' || order.status === 'pending') {
            // Fetch customer name
            let customerName = 'Unknown Customer';
            
            if (order.customer_id) {
              try {
                const { data: customer } = await supabase
                  .from('users')
                  .select('full_name')
                  .eq('id', order.customer_id)
                  .single();
                
                if (customer) {
                  customerName = customer.full_name;
                }
              } catch (error) {
                console.error('Error fetching customer name:', error);
              }
            }
            
            // Show notification
            await showOrderNotification(order.order_number, customerName);
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up order notifications subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUser, showOrderNotification]);

  return null;
};
