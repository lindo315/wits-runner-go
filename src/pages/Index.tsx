import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Redirect to the dashboard page
    navigate("/dashboard");
  }, [navigate]);

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Nutrix Runner</h1>
        <p className="text-xl text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default Index;
