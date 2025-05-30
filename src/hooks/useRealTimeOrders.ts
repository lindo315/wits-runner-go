
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  order_number: string;
  status: "pending" | "ready" | "picked_up" | "in_transit" | "delivered";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: string;
  runner_id: string | null;
  merchant_id?: string;
  merchant: {
    name: string;
    location: string;
  } | null;
  customer_addresses: {
    building_name: string;
    room_number: string;
    delivery_instructions: string | null;
  } | null;
  order_items: {
    id: string;
    quantity: number;
    menu_item: {
      name: string;
    } | null;
    special_requests: string | null;
  }[] | null;
  total_amount: number;
  created_at: string;
  delivered_at: string | null;
}

interface UseRealTimeOrdersProps {
  currentUser: any;
  activeTab: string;
  onNewOrder?: (order: Order) => void;
}

export const useRealTimeOrders = ({ currentUser, activeTab, onNewOrder }: UseRealTimeOrdersProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('connecting');
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Audio notification
  const playNewOrderSound = useCallback(() => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+L+o9ZBKfn7rNTHr/Y4F9bWw8Y=');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore audio play errors (browser restrictions)
      });
    } catch (error) {
      // Ignore audio errors
    }
  }, []);

  // Fetch orders based on active tab
  const fetchOrders = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching orders for tab:", activeTab);
      console.log("Current user ID:", currentUser.id);
      
      let query = supabase
        .from("orders")
        .select(`
          id,
          order_number,
          status,
          payment_status,
          payment_method,
          runner_id,
          merchant_id,
          total_amount,
          created_at,
          delivered_at,
          merchant:merchant_id (
            name,
            location
          ),
          customer_addresses:delivery_address_id (
            building_name,
            room_number,
            delivery_instructions
          ),
          order_items (
            id,
            quantity,
            special_requests,
            menu_item:menu_item_id (
              name
            )
          )
        `);
      
      switch (activeTab) {
        case "available":
          query = query
            .in("status", ["ready", "pending"])
            .is("runner_id", null);
          break;
        case "active":
          query = query
            .in("status", ["picked_up", "in_transit"])
            .eq("runner_id", currentUser.id);
          break;
        case "completed":
          query = query
            .eq("status", "delivered")
            .eq("runner_id", currentUser.id);
          break;
        default:
          query = query.in("status", ["ready", "pending"]);
      }
      
      const { data, error: fetchError } = await query.order("created_at", { ascending: false });
      
      if (fetchError) {
        console.error("Query error:", fetchError);
        setError(`Failed to load orders: ${fetchError.message || "Unknown error"}`);
        throw fetchError;
      }
      
      console.log("Orders fetched:", data);
      setOrders(data as Order[]);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(`Failed to load orders: ${err.message || "Please try again later."}`);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, currentUser]);

  // Set up real-time subscription
  useEffect(() => {
    if (!currentUser) return;

    console.log("Setting up real-time subscription for orders");
    setConnectionStatus('connecting');

    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('New order received via real-time:', payload);
          
          const newOrder = payload.new as any;
          
          // Check if this order should be shown in current tab
          const shouldShowInAvailable = activeTab === 'available' && 
            ['ready', 'pending'].includes(newOrder.status) && 
            !newOrder.runner_id;
            
          if (shouldShowInAvailable) {
            // Add visual and audio notification
            setNewOrderIds(prev => new Set([...prev, newOrder.id]));
            playNewOrderSound();
            
            toast({
              title: "New Order Available!",
              description: `Order #${newOrder.order_number} - R${newOrder.total_amount?.toFixed(2)}`,
              duration: 5000,
            });
            
            // Fetch complete order data
            setTimeout(() => {
              fetchOrders();
            }, 100);
            
            if (onNewOrder) {
              onNewOrder(newOrder);
            }
            
            // Remove new order highlight after 5 seconds
            setTimeout(() => {
              setNewOrderIds(prev => {
                const updated = new Set(prev);
                updated.delete(newOrder.id);
                return updated;
              });
            }, 5000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated via real-time:', payload);
          
          // Refresh orders when updates occur
          setTimeout(() => {
            fetchOrders();
          }, 100);
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('online');
          console.log('Successfully subscribed to orders real-time updates');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setConnectionStatus('offline');
          console.error('Real-time subscription error:', status);
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            setConnectionStatus('connecting');
          }, 5000);
        }
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [currentUser, activeTab, fetchOrders, onNewOrder, playNewOrderSound, toast]);

  // Initial fetch when tab or user changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    connectionStatus,
    newOrderIds,
    refetch: fetchOrders,
    setOrders
  };
};
