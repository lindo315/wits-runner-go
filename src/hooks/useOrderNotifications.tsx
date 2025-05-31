
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';

export const useOrderNotifications = () => {
  const { showOrderNotification, permission, preferences } = useNotifications();

  useEffect(() => {
    // Only set up real-time subscription if notifications are enabled and permission granted
    if (permission !== 'granted' || !preferences.enabled) {
      return;
    }

    console.log('Setting up real-time order notifications...');
    
    const ordersChannel = supabase
      .channel('order_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('New order detected for notification:', payload.new);
          
          const newOrder = payload.new;
          if (newOrder?.id && newOrder?.order_number) {
            // Get customer name - for now using customer_id, but could fetch from users table
            const customerName = newOrder.customer_id || 'Unknown Customer';
            
            await showOrderNotification(
              newOrder.order_number,
              customerName
            );
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up order notifications subscription...');
      supabase.removeChannel(ordersChannel);
    };
  }, [permission, preferences.enabled, showOrderNotification]);
};
