import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: string;
  total_amount: number;
}

const Index = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!currentUser) {
          setError("Not authenticated");
          return;
        }
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('customer_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching orders:", error);
          setError(`Failed to load orders: ${error.message}`);
        } else {
          setOrders(data || []);
        }
      } catch (err: any) {
        console.error("Error in fetchOrders:", err);
        setError(`An unexpected error occurred: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  // Add effect to show order cancellation alerts for recent cancelled orders
  useEffect(() => {
    const checkRecentCancelledOrders = async () => {
      if (!currentUser) return;

      const { data: recentCancelledOrders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', currentUser.id)
        .eq('status', 'cancelled')
        .eq('cancellation_reason', 'Order not accepted within 15 minutes')
        .gte('cancelled_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
        .order('cancelled_at', { ascending: false });

      if (error) {
        console.error('Error checking recent cancelled orders:', error);
        return;
      }

      if (recentCancelledOrders && recentCancelledOrders.length > 0) {
        const latestCancelled = recentCancelledOrders[0];
        toast({
          title: "⏰ Recent Order Cancellation",
          description: `Your order #${latestCancelled.order_number} was cancelled because no runner accepted it within 15 minutes. You can place a new order anytime.`,
          variant: "destructive",
          duration: 8000,
        });
      }
    };

    checkRecentCancelledOrders();
  }, [currentUser, toast]);
  
  const statusColors = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    ready: "bg-blue-50 text-blue-700 border-blue-200",
    picked_up: "bg-purple-50 text-purple-700 border-purple-200",
    in_transit: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200"
  };

  const statusLabels = {
    pending: "Pending",
    ready: "Ready",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-muted-foreground">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md shadow-lg">
              <CardContent className="pt-6 text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                <p className="text-lg font-medium text-red-600">Error Loading Orders</p>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Your Orders</h1>
        {orders.length === 0 ? (
          <Card className="w-full max-w-md mx-auto shadow-lg">
            <CardContent className="pt-6 text-center space-y-4">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-lg font-medium">No Orders Yet</p>
              <p className="text-muted-foreground">Place your first order to see it here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card key={order.id} className="bg-white shadow-md">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Order #{order.order_number}</span>
                    <Badge className={`${statusColors[order.status as keyof typeof statusColors]} border font-medium`}>
                      {statusLabels[order.status as keyof typeof statusLabels]}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  Total: R{order.total_amount.toFixed(2)}
                  <div className="mt-4">
                    <Button asChild variant="secondary">
                      <Link to={`/order/${order.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
