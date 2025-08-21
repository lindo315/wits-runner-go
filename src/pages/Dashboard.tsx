import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  ShoppingBag, 
  Phone, 
  User, 
  RefreshCcw, 
  CreditCard, 
  Calendar, 
  Clock, 
  WalletCards, 
  TrendingUp,
  ArrowRightCircle,
  CheckCircle2,
  AlertCircle,
  Zap,
  Star,
  Activity,
  Bell
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { getRunnerBaseFee } from "@/lib/utils";
import { RunnerNotifications } from "@/components/RunnerNotifications";
import { PinVerificationDialog } from "@/components/PinVerificationDialog";
import { CollectionPinDisplay } from "@/components/CollectionPinDisplay";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileHeader } from "@/components/MobileHeader";
import { MobileTabNavigation } from "@/components/MobileTabNavigation";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";
import { MobileOrderCard } from "@/components/MobileOrderCard";
import { MobileSearchBar } from "@/components/MobileSearchBar";
import { MobileEarningsCard } from "@/components/MobileEarningsCard";

// Define the types based on the database schema and actual returned data
interface Order {
  id: string;
  order_number: string;
  status: "pending" | "ready" | "picked_up" | "in_transit" | "delivered";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  payment_method: string;
  runner_id: string | null;
  merchant_id?: string;
  delivery_pin?: string;
  collection_pin?: string;
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

interface EarningsSummary {
  today: { count: number; amount: number };
  weekly: { count: number; amount: number };
  monthly: { count: number; amount: number };
  total: { count: number; amount: number };
}

interface Earning {
  id: string;
  order_id: string;
  runner_id: string;
  base_fee: number;
  tip_amount: number;
  bonus_amount: number;
  total_earned: number;
  created_at: string;
}

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary>({
    today: { count: 0, amount: 0 },
    weekly: { count: 0, amount: 0 },
    monthly: { count: 0, amount: 0 },
    total: { count: 0, amount: 0 }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runnerBaseFee, setRunnerBaseFee] = useState<number>(10.00);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [isVerifyingCollection, setIsVerifyingCollection] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Status styling
  const statusLabels = {
    pending: "Pending",
    ready: "Ready",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    delivered: "Delivered"
  };
  
  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    ready: "bg-amber-100 text-amber-800",
    picked_up: "bg-blue-100 text-blue-800",
    in_transit: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800"
  };
  
  // Payment status styling
  const paymentStatusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800"
  };
  
  // Helper to format dates
  const formatOrderDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };
  
  // Fetch orders based on active tab
  const fetchOrders = async () => {
    if (!currentUser || isUpdatingOrder) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Fetching orders for tab:", activeTab);
      console.log("Current user ID:", currentUser.id);
      
      // First, check if there are any orders in the table at all
      const { count: totalOrdersCount, error: countError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
        
      if (countError) {
        console.error("Error counting total orders:", countError);
      } else {
        console.log("Total orders in database:", totalOrdersCount);
      }
      
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
          delivery_address_id,
          delivery_pin,
          collection_pin,
          merchant:merchant_id (
            name,
            location
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
          // Only show orders that have been accepted by merchants (status = 'ready')
          console.log("Querying available orders: status = 'ready', runner_id=null");
          query = query
            .eq("status", "ready")
            .is("runner_id", null);
          break;
        case "active":
          query = query
            .in("status", ["ready", "picked_up", "in_transit"])
            .eq("runner_id", currentUser.id);
          break;
        case "completed":
          query = query
            .eq("status", "delivered")
            .eq("runner_id", currentUser.id);
          break;
        default:
          query = query.eq("status", "ready");
      }
      
      const { data, error: fetchError } = await query.order("created_at", { ascending: false });
      
      if (fetchError) {
        console.error("Query error:", fetchError);
        setError(`Failed to load orders: ${fetchError.message || "Unknown error"}`);
        throw fetchError;
      }
      
      console.log("Orders fetched:", data);
      console.log("Number of orders:", data?.length || 0);
      
      // Fetch delivery addresses for each order and attach them
      const ordersWithAddresses = await Promise.all(
        (data || []).map(async (order: any) => {
          let customer_addresses = null;
          if (order.delivery_address_id) {
            const { data: addressData } = await supabase
              .from("customer_addresses")
              .select("building_name, room_number, delivery_instructions")
              .eq("id", order.delivery_address_id)
              .single();
            customer_addresses = addressData;
          }
          return {
            ...order,
            customer_addresses
          };
        })
      );
      
      // Debugging any data issues
      if (ordersWithAddresses && ordersWithAddresses.length > 0) {
        console.log("Sample order data with address:", ordersWithAddresses[0]);
      } else {
        console.log("No orders found for the current query");
        
        // If no orders found, check if there are any "ready" or "pending" orders regardless of runner_id
        if (activeTab === "available") {
          const { data: availableOrders } = await supabase
            .from("orders")
            .select("id, status, runner_id")
            .eq("status", "ready");
            
          console.log("All ready orders:", availableOrders);
        }
      }
      
      // Type assertion to match the Order interface
      setOrders(ordersWithAddresses as Order[]);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(`Failed to load orders: ${err.message || "Please try again later."}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch earnings data
  const fetchEarnings = async () => {
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      console.log("Fetching earnings for runner ID:", currentUser.id);
      
      // Directly fetch from runner_earnings table
      const { data: earningsData, error: earningsError } = await supabase
        .from("runner_earnings")
        .select("*")
        .eq("runner_id", currentUser.id);
      
      if (earningsError) {
        console.error("Error fetching earnings:", earningsError);
        return;
      }
      
      console.log("Earnings data fetched:", earningsData);
      
      // Calculate summary
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const summary: EarningsSummary = {
        today: { count: 0, amount: 0 },
        weekly: { count: 0, amount: 0 },
        monthly: { count: 0, amount: 0 },
        total: { count: earningsData?.length || 0, amount: 0 }
      };
      
      if (earningsData && earningsData.length > 0) {
        earningsData.forEach((earning: Earning) => {
          // Add to total
          summary.total.amount += earning.total_earned;
          
          // Check if today
          const earningDate = new Date(earning.created_at);
          if (earningDate >= today) {
            summary.today.count++;
            summary.today.amount += earning.total_earned;
          }
          
          // Check if this week
          if (earningDate >= weekStart) {
            summary.weekly.count++;
            summary.weekly.amount += earning.total_earned;
          }
          
          // Check if this month
          if (earningDate >= monthStart) {
            summary.monthly.count++;
            summary.monthly.amount += earning.total_earned;
          }
        });
      }
      
      console.log("Earnings summary calculated:", summary);
      setEarnings(summary);
    } catch (err) {
      console.error("Error calculating earnings:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle order acceptance with active orders limit
  const handleAcceptOrder = async (orderId: string) => {
    if (!currentUser) return;
    
    if (!isAvailable) {
      toast({
        title: "You are currently unavailable",
        description: "Please set your status to available to accept orders",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // First check the order's payment status
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("payment_status")
        .eq("id", orderId)
        .single();
      
      if (orderError) {
        console.error("Error checking order payment status:", orderError);
        toast({
          title: "Failed to check order details",
          description: "Please try again",
          variant: "destructive"
        });
        return;
      }
      
      if (orderData.payment_status !== "paid") {
        toast({
          title: "Cannot accept order",
          description: "Orders can only be accepted after payment is confirmed",
          variant: "destructive"
        });
        return;
      }
      
      // Check current active orders count
      const { count: activeOrdersCount, error: countError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("runner_id", currentUser.id)
        .in("status", ["picked_up", "in_transit"]);
      
      if (countError) {
        console.error("Error checking active orders:", countError);
        toast({
          title: "Failed to check active orders",
          description: "Please try again",
          variant: "destructive"
        });
        return;
      }
      
      // Check if runner already has 3 active orders
      if (activeOrdersCount && activeOrdersCount >= 3) {
        toast({
          title: "Maximum active orders reached",
          description: "You can only have 3 active orders at once. Please complete some orders before accepting new ones.",
          variant: "destructive"
        });
        return;
      }
      
      // Update order status and assign runner
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "ready",
          runner_id: currentUser.id
        })
        .eq("id", orderId);
      
      if (updateError) throw updateError;
      
      // Add to order status history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: orderId,
          status: "picked_up",
          changed_by: currentUser.id,
          notes: "Order accepted by runner - awaiting collection verification"
        });
      
      if (historyError) {
        console.error("Error updating order history:", historyError);
      }
      
      toast({
        title: "Order accepted",
        description: "You have successfully accepted this order. Show the collection PIN to the merchant."
      });
      
      // Switch to active tab and refresh orders
      setActiveTab("active");
      fetchOrders();
    } catch (err) {
      console.error("Error accepting order:", err);
      toast({
        title: "Failed to accept order",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  

  // Order status update handlers
  const handleMarkInTransit = async (orderId: string) => {
    if (!currentUser) return;
    
    try {
      setIsUpdatingOrder(true);
      setIsLoading(true);
      console.log("Marking order as in transit...");
      console.log("Order ID:", orderId);
      console.log("Current user ID:", currentUser.id);
      
      // Update order status
      const { data, error: updateError } = await supabase
        .from("orders")
        .update({ status: "in_transit" })
        .eq("id", orderId)
        .eq("runner_id", currentUser.id)
        .select();
      
      if (updateError) {
        console.error("Error updating order status:", updateError);
        toast({
          title: "Update failed",
          description: `Could not update order status: ${updateError.message}`,
          variant: "destructive"
        });
        throw updateError;
      }
      
      console.log("Update response:", data);
      
      // Add to order status history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: orderId,
          status: "in_transit",
          changed_by: currentUser.id,
          notes: "Order in transit to delivery location"
        });
      
      if (historyError) {
        console.error("Error updating order history:", historyError);
      }
      
      toast({
        title: "Order updated",
        description: "Order marked as in transit"
      });
      
      // Update orders in state without refetching immediately
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: "in_transit" } : order
        )
      );
      
      // Short delay before refetching to ensure the state update is completed
      setTimeout(() => {
        fetchOrders();
        setIsUpdatingOrder(false);
      }, 500);
    } catch (err) {
      console.error("Error updating order:", err);
      toast({
        title: "Update failed",
        description: "Could not update order status. Please try again.",
        variant: "destructive"
      });
      setIsUpdatingOrder(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMarkDelivered = (orderId: string) => {
    console.log("Mark Delivered button clicked for order:", orderId);
    setSelectedOrderId(orderId);
    setShowPinDialog(true);
  };

  const handlePinVerification = async (pin: string): Promise<boolean> => {
    if (!currentUser || !selectedOrderId) return false;
    
    try {
      setIsVerifyingPin(true);
      
      // Verify PIN against the order's delivery_pin
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("delivery_pin")
        .eq("id", selectedOrderId)
        .eq("runner_id", currentUser.id)
        .single();
      
      if (orderError) {
        console.error("Error fetching order PIN:", orderError);
        return false;
      }
      
      if (!orderData || (orderData as any).delivery_pin !== pin) {
        return false;
      }
      
      // PIN is correct, proceed with delivery
      return await completeDelivery(selectedOrderId);
    } catch (err) {
      console.error("Error verifying PIN:", err);
      return false;
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const completeDelivery = async (orderId: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    try {
      setIsUpdatingOrder(true);
      setIsLoading(true);
      const now = new Date().toISOString();
      
      // Update order status
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          delivered_at: now
        })
        .eq("id", orderId)
        .eq("runner_id", currentUser.id);
      
      if (updateError) throw updateError;
      
      // Add to order status history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: orderId,
          status: "delivered",
          changed_by: currentUser.id,
          notes: "Order successfully delivered"
        });
      
      if (historyError) {
        console.error("Error updating order history:", historyError);
      }
      
      // Create an earning record with more detailed fee structure
      const { data: orderData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("id", orderId)
        .single();
      
      if (orderData) {
        const baseFee = await getRunnerBaseFee(); // Get base fee from configuration
        const tipAmount = 0.00; // Could be calculated or provided by user input
        const bonusAmount = 0.00; // Could be calculated based on conditions
        const totalEarned = baseFee + tipAmount + bonusAmount;
        
        const { error: earningsError } = await supabase.from("runner_earnings").insert({
          runner_id: currentUser.id,
          order_id: orderId,
          base_fee: baseFee,
          tip_amount: tipAmount,
          bonus_amount: bonusAmount,
          total_earned: totalEarned,
          payout_status: "pending"
        });
        
        if (earningsError) {
          console.error("Error creating earnings record:", earningsError);
          toast({
            title: "Error recording earnings",
            description: "Your earnings will still be tracked, but please contact support if you don't see them in your dashboard",
            variant: "destructive"
          });
        } else {
          // Immediately fetch updated earnings to refresh the dashboard
          fetchEarnings();
        }
      }
      
      toast({
        title: "Order delivered",
        description: "Order has been successfully delivered and earnings recorded"
      });
      
      // Update orders in state first
      setOrders(prevOrders => 
        prevOrders.filter(order => order.id !== orderId)
      );
      
      // Short delay before refetching to ensure the state update is completed
      setTimeout(() => {
        // Set active tab to completed since the order was delivered
        setActiveTab("completed");
        fetchOrders();
        setIsUpdatingOrder(false);
      }, 500);
      
      return true;
    } catch (err) {
      console.error("Error marking order as delivered:", err);
      toast({
        title: "Update failed",
        description: "Could not mark order as delivered",
        variant: "destructive"
      });
      setIsUpdatingOrder(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle runner availability toggle
  const handleStatusChange = (checked: boolean) => {
    setIsAvailable(checked);
    toast({
      title: checked ? "You are now available" : "You are now unavailable",
      description: checked 
        ? "You can now accept new deliveries" 
        : "You won't receive new delivery requests"
    });
  };

  const handleVerifyCollection = async (orderId: string) => {
    try {
      setIsVerifyingCollection(true);
      
      // Update order status to picked_up after collection verification
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'picked_up',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: "Collection Verified",
        description: "Order collected from merchant. You can now mark it as in transit.",
      });

      fetchOrders();
    } catch (error) {
      console.error('Error verifying collection:', error);
      toast({
        title: "Error",
        description: "Failed to verify collection. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifyingCollection(false);
    }
  };
  
  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentUser) return;
    
    // Subscribe to orders changes
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Refresh orders when relevant changes are detected
          if (!isUpdatingOrder) {
            fetchOrders();
          }
        }
      )
      .subscribe();
    
    // Subscribe to earnings changes
    const earningsChannel = supabase
      .channel('earnings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'runner_earnings',
          filter: `runner_id=eq.${currentUser.id}`
        },
        (payload) => {
          console.log('Real-time earnings update received:', payload);
          // Refresh earnings when relevant changes are detected
          fetchEarnings();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(earningsChannel);
    };
  }, [currentUser, isUpdatingOrder]);
  
  // Effect to fetch data when tab changes
  useEffect(() => {
    fetchOrders();
  }, [activeTab, currentUser]);
  
  // Effect to fetch earnings data on mount
  useEffect(() => {
    fetchEarnings();
    loadRunnerBaseFee();
  }, [currentUser]);

  // Load runner base fee from config
  const loadRunnerBaseFee = async () => {
    try {
      const baseFee = await getRunnerBaseFee();
      setRunnerBaseFee(baseFee);
    } catch (err) {
      console.error("Error loading runner base fee:", err);
    }
  };
  
  const handleManualRefresh = () => {
    fetchOrders();
    fetchEarnings();
    toast({
      title: "Refreshing data",
      description: "Fetching the latest order and earnings data",
    });
  };
  
  // Filter orders based on search query
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(searchLower) ||
      order.merchant?.name.toLowerCase().includes(searchLower) ||
      order.customer_addresses?.building_name.toLowerCase().includes(searchLower)
    );
  });

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
        <MobileHeader 
          title="Runner Dashboard"
          onNotificationClick={() => setActiveTab("notifications")}
          hasNotifications={false}
          showAvailabilityToggle={activeTab === "available"}
          isAvailable={isAvailable}
          onAvailabilityChange={setIsAvailable}
        />
        
        <MobileSearchBar 
          placeholder="Search orders, merchants..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
        
        <MobileTabNavigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          availableCount={orders.filter(o => o.status === "ready" && !o.runner_id).length}
          activeCount={orders.filter(o => ["ready", "picked_up", "in_transit"].includes(o.status) && o.runner_id === currentUser?.id).length}
          completedCount={orders.filter(o => o.status === "delivered" && o.runner_id === currentUser?.id).length}
        />
        
        {/* Mobile Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          {activeTab === "available" && (
            <div className="pb-2">
              {!isAvailable && (
                <div className="mx-4 mt-4 mb-2 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-amber-800 font-medium text-sm">You're currently unavailable</p>
                      <p className="text-amber-700 text-xs">Toggle availability above to start accepting orders</p>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading available orders...</p>
                  <p className="text-gray-500 text-sm">Finding the best opportunities</p>
                </div>
              )}
              
              {error && (
                <div className="mx-4 my-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="text-red-800 font-medium text-sm">Unable to load orders</p>
                      <p className="text-red-700 text-xs">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {!isLoading && !error && filteredOrders.filter(order => order.status === "ready" && !order.runner_id).length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Zap className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No orders available</h3>
                  <p className="text-gray-600 text-sm mb-6">New delivery opportunities will appear here</p>
                  <Button 
                    onClick={handleManualRefresh}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-white"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh Orders
                  </Button>
                </div>
              )}
              
              {filteredOrders
                .filter(order => order.status === "ready" && !order.runner_id)
                .map(order => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    onAccept={handleAcceptOrder}
                    onViewDetails={(orderId) => navigate(`/order-details/${orderId}`)}
                    showActionButton={isAvailable}
                    actionButtonText="Accept Order"
                  />
                ))}
            </div>
          )}
          
          {activeTab === "active" && (
            <div className="pb-2">
              {isLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 font-medium">Loading active orders...</p>
                </div>
              )}
              
              {!isLoading && filteredOrders.filter(order => ["ready", "picked_up", "in_transit"].includes(order.status) && order.runner_id === currentUser?.id).length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ArrowRightCircle className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No active orders</h3>
                  <p className="text-gray-600 text-sm">Your accepted orders will appear here</p>
                </div>
              )}
              
              {filteredOrders
                .filter(order => ["ready", "picked_up", "in_transit"].includes(order.status) && order.runner_id === currentUser?.id)
                .map(order => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={(orderId) => navigate(`/order-details/${orderId}`)}
                  />
                ))}
            </div>
          )}
          
          {activeTab === "completed" && (
            <div className="pb-2">
              {!isLoading && filteredOrders.filter(order => order.status === "delivered" && order.runner_id === currentUser?.id).length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No completed orders</h3>
                  <p className="text-gray-600 text-sm">Your delivery history will appear here</p>
                </div>
              )}
              
              {filteredOrders
                .filter(order => order.status === "delivered" && order.runner_id === currentUser?.id)
                .map(order => (
                  <MobileOrderCard
                    key={order.id}
                    order={order}
                    onViewDetails={(orderId) => navigate(`/order-details/${orderId}`)}
                  />
                ))}
            </div>
          )}
          
          {activeTab === "earnings" && (
            <MobileEarningsCard earnings={earnings} />
          )}
          
          {activeTab === "notifications" && (
            <div className="p-4">
              <RunnerNotifications />
            </div>
          )}
        </div>
        
        <MobileBottomNavigation 
          activeTab={activeTab === "earnings" ? "profile" : activeTab}
          onTabChange={(tab) => {
            if (tab === "create") {
              // Handle create action
              toast({
                title: "Coming Soon",
                description: "Order creation feature will be available soon",
              });
              return;
            }
            if (tab === "profile") {
              setActiveTab("earnings");
              return;
            }
            setActiveTab(tab);
          }}
        />
        
        {/* PIN Verification Dialog */}
        <PinVerificationDialog
          isOpen={showPinDialog}
          onClose={() => {
            setShowPinDialog(false);
            setSelectedOrderId(null);
          }}
          onVerify={handlePinVerification}
          isVerifying={isVerifyingPin}
        />
      </div>
    );
  }

  // Calculate counts for each order status
  const activeOrdersCount = orders.filter(order => 
    order.status === "picked_up" || order.status === "in_transit").length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
        {/* Enhanced Header & User Info */}
        <div className="rounded-xl sm:rounded-2xl border bg-white/80 backdrop-blur-sm shadow-xl p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg sm:rounded-xl">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Runner Dashboard
                </h1>
              </div>
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                Manage your deliveries, track orders and maximize your earnings
              </p>
              {currentUser && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-full">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-gray-800 text-sm sm:text-base truncate">{currentUser.email}</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200 text-xs sm:text-sm w-fit">
                    Active Runner
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center justify-between sm:justify-start space-x-3 bg-gradient-to-r from-white to-gray-50 p-3 sm:p-4 rounded-xl border shadow-sm">
                <Switch 
                  id="runner-status" 
                  checked={isAvailable} 
                  onCheckedChange={handleStatusChange}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label 
                  htmlFor="runner-status" 
                  className={`font-semibold text-sm sm:text-base ${isAvailable ? "text-green-600" : "text-red-500"}`}
                >
                  {isAvailable ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="hidden sm:inline">Available for Orders</span>
                      <span className="sm:hidden">Available</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Unavailable</span>
                    </div>
                  )}
                </Label>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate("/profile")}
                className="flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200 text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
              >
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Profile Settings</span>
                <span className="sm:hidden">Profile</span>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ArrowRightCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">{activeOrdersCount}</p>
                    <p className="text-blue-100 text-xs sm:text-sm font-medium">Active Orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4 text-blue-200" />
                  <span className="text-blue-100 text-xs sm:text-sm">Orders in progress</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">R{earnings.today.amount.toFixed(2)}</p>
                    <p className="text-green-100 text-xs sm:text-sm font-medium">Today's Earnings</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <WalletCards className="h-3 w-3 sm:h-4 sm:w-4 text-green-200" />
                  <span className="text-green-100 text-xs sm:text-sm">{earnings.today.count} deliveries today</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white sm:col-span-2 lg:col-span-1">
            <CardContent className="p-0">
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">R{earnings.total.amount.toFixed(2)}</p>
                    <p className="text-purple-100 text-xs sm:text-sm font-medium">Total Earnings</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-purple-200" />
                  <span className="text-purple-100 text-xs sm:text-sm">{earnings.total.count} total deliveries</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Orders Tabs */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-0 bg-gradient-to-r from-white to-gray-50 rounded-t-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg sm:text-xl lg:text-2xl text-gray-800">Order Management</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-200 text-xs sm:text-sm"
              >
                <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6 sm:mb-8 bg-gray-100 p-1 rounded-xl w-full">
                <TabsTrigger 
                  value="available" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Zap className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium">Available</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="active" 
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <ArrowRightCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium">Active</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium">Completed</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-white data-[state=active]:text-orange-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="font-medium">Notifications</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              {/* Available Orders Tab */}
              <TabsContent value="available">
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg">
                        <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      </div>
                      <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">Available Orders</h2>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 w-fit">
                      {orders.length} orders
                    </Badge>
                  </div>
                
                  {isLoading && (
                    <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-blue-50 to-white rounded-xl sm:rounded-2xl border">
                      <div className="animate-pulse flex flex-col items-center">
                        <div className="h-12 w-12 sm:h-16 sm:w-16 bg-blue-200 rounded-full mb-4 sm:mb-6 animate-bounce"></div>
                        <div className="h-4 sm:h-6 w-32 sm:w-40 bg-blue-100 rounded-full mb-3 sm:mb-4"></div>
                        <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-100 rounded-full"></div>
                      </div>
                    </div>
                  )}
                
                  {error && (
                    <div className="text-center py-8 sm:py-12 bg-red-50 rounded-xl sm:rounded-2xl border border-red-100">
                      <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-red-400 mx-auto mb-3 sm:mb-4" />
                      <p className="text-red-600 font-semibold text-sm sm:text-base lg:text-lg px-4">{error}</p>
                    </div>
                  )}
                
                  {!isLoading && !error && orders.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl border">
                      <ShoppingBag className="h-16 w-16 sm:h-20 sm:w-20 text-gray-300 mx-auto mb-4 sm:mb-6" />
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No available orders</h3>
                      <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base px-4">
                        Check back soon for new delivery opportunities
                      </p>
                      <Button 
                        onClick={handleManualRefresh}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg text-sm sm:text-base"
                      >
                        <RefreshCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Refresh Orders
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 sm:space-y-6">
                      {orders.map(order => (
                        <Card key={order.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
                          <CardContent className="p-0">
                            <div className="p-4 sm:p-6 lg:p-8">
                              <div className="space-y-4 sm:space-y-6">
                                <div className="space-y-3 sm:space-y-4">
                                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                    <h3 className="font-bold text-lg sm:text-xl text-gray-800">Order #{order.order_number}</h3>
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-2 sm:px-3 py-1 text-xs sm:text-sm">
                                      {statusLabels[order.status]}
                                    </Badge>
                                    <Badge className={`px-2 sm:px-3 py-1 text-xs sm:text-sm ${paymentStatusColors[order.payment_status] || "bg-gray-100"}`}>
                                      {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <span className="text-xs sm:text-sm">{formatOrderDate(order.created_at)}</span>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="flex items-start gap-3 p-3 sm:p-4 bg-purple-50 rounded-xl border border-purple-100">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-1 text-purple-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-semibold text-gray-800 text-sm sm:text-base">Delivery to:</p>
                                      <p className="text-gray-700 text-sm sm:text-base break-words">
                                        {order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {order.order_items && order.order_items.length > 0 && (
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-3 sm:p-4 border">
                                      <p className="font-semibold mb-2 sm:mb-3 text-gray-800 text-sm sm:text-base">Order items:</p>
                                      <ul className="space-y-2">
                                        {order.order_items.map((item, index) => (
                                          <li key={index} className="flex items-center gap-2 sm:gap-3">
                                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 sm:px-3 py-1 font-bold flex-shrink-0">
                                              {item.quantity}x
                                            </span>
                                            <span className="text-gray-700 font-medium text-xs sm:text-sm break-words">{item.menu_item?.name}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
                                  <div className="text-center sm:text-left">
                                    <p className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">R{order.total_amount?.toFixed(2)}</p>
                                    <p className="text-gray-500 text-sm sm:text-base">Total amount</p>
                                    <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                      <p className="text-green-700 font-semibold text-xs sm:text-sm">You'll earn: R{runnerBaseFee.toFixed(2)}</p>
                                    </div>
                                  </div>
                                  <Button 
                                    onClick={() => handleAcceptOrder(order.id)}
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 sm:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                                  >
                                    Accept Order
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Active Orders Tab */}
              <TabsContent value="active">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Active Orders</h2>
                
                {isLoading && (
                  <div className="text-center py-8 sm:py-12 bg-white rounded-lg border">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-8 w-8 sm:h-12 sm:w-12 bg-purple-100 rounded-full mb-3 sm:mb-4"></div>
                      <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 rounded mb-2 sm:mb-3"></div>
                      <div className="h-2 sm:h-3 w-16 sm:w-24 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-8 sm:py-12 bg-white rounded-lg border">
                    <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 font-medium text-sm sm:text-base px-4">{error}</p>
                  </div>
                )}
                
                {!isLoading && !error && orders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-white rounded-lg border">
                    <ArrowRightCircle className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-muted-foreground font-medium text-sm sm:text-base">No active orders</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 px-4">
                      Orders you accept will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Card key={order.id} className="hover:border-purple-200 transition-colors border-l-4 border-l-purple-500">
                        <CardContent className="p-0">
                          <div className="p-4 sm:p-6">
                            <div className="space-y-4 sm:space-y-6">
                              <div className="space-y-3 sm:space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-base sm:text-lg">Order #{order.order_number}</h3>
                                  <Badge className={statusColors[order.status]}>
                                    {statusLabels[order.status]}
                                  </Badge>
                                  <Badge className={paymentStatusColors[order.payment_status] || "bg-gray-100"}>
                                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatOrderDate(order.created_at)}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                                    <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-sm sm:text-base">Pickup from:</p>
                                      <p className="text-sm font-semibold break-words">{order.merchant?.name}</p>
                                      <p className="text-xs sm:text-sm text-muted-foreground break-words">{order.merchant?.location}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-md">
                                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-purple-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-sm sm:text-base">Deliver to:</p>
                                      <p className="text-sm font-semibold break-words">{order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}</p>
                                      {order.customer_addresses?.delivery_instructions && (
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">
                                          Note: {order.customer_addresses.delivery_instructions}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 text-green-600 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-sm sm:text-base">Payment Details:</p>
                                      <p className="text-xs sm:text-sm">{order.payment_method === "cash" ? "Cash on Delivery" : "Online Payment"}</p>
                                      <p className={`text-xs sm:text-sm font-medium ${
                                        order.payment_status === 'paid' ? 'text-green-600' : 
                                        order.payment_status === 'failed' ? 'text-red-600' : 
                                        'text-yellow-600'
                                      }`}>
                                        Status: {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                      </p>
                                      {order.payment_method === "cash" && (
                                        <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded text-xs text-yellow-800">
                                          <strong>Collect: R{order.total_amount?.toFixed(2)} in cash</strong>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
                                <div className="text-center sm:text-left">
                                  <p className="text-xl sm:text-2xl font-bold text-purple-600">R{order.total_amount?.toFixed(2)}</p>
                                  <p className="text-xs sm:text-sm text-muted-foreground">Total amount</p>
                                </div>
                                
                                <div className="flex flex-col sm:flex-row gap-2">
                                  {/* Show collection PIN for ready orders */}
                                  {order.status === "ready" && order.collection_pin && (
                                    <div className="w-full mb-4">
                                      <CollectionPinDisplay 
                                        pin={order.collection_pin}
                                        orderNumber={order.order_number}
                                        merchantName={order.merchant?.name}
                                        onVerify={() => handleVerifyCollection(order.id)}
                                        isVerifying={isVerifyingCollection}
                                      />
                                    </div>
                                  )}
                                  
                                  {/* Mark In Transit button for picked up orders */}
                                  {order.status === "picked_up" && (
                                    <Button 
                                      onClick={() => handleMarkInTransit(order.id)}
                                      size="lg"
                                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 w-full sm:w-auto"
                                    >
                                      Mark In Transit
                                    </Button>
                                  )}
                                  
                                  {order.status === "in_transit" && (
                                    <Button 
                                      onClick={() => handleMarkDelivered(order.id)}
                                      size="lg"
                                      className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 w-full sm:w-auto"
                                    >
                                      Mark Delivered
                                    </Button>
                                  )}
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => navigate(`/order-details/${order.id}`)}
                                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                                  >
                                    <User className="h-3 w-3" />
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Completed Orders Tab */}
              <TabsContent value="completed">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Completed Orders</h2>
                
                {isLoading && (
                  <div className="text-center py-8 sm:py-12 bg-white rounded-lg border">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-8 w-8 sm:h-12 sm:w-12 bg-green-100 rounded-full mb-3 sm:mb-4"></div>
                      <div className="h-3 sm:h-4 w-24 sm:w-32 bg-gray-200 rounded mb-2 sm:mb-3"></div>
                      <div className="h-2 sm:h-3 w-16 sm:w-24 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-8 sm:py-12 bg-white rounded-lg border">
                    <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 font-medium text-sm sm:text-base px-4">{error}</p>
                  </div>
                )}
                
                {!isLoading && !error && orders.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-white rounded-lg border">
                    <CheckCircle2 className="h-8 w-8 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-muted-foreground font-medium text-sm sm:text-base">No completed orders yet</p>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 px-4">
                      Orders you've delivered will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Card key={order.id} className="hover:border-green-200 transition-colors border-l-4 border-l-green-500">
                        <CardContent className="p-0">
                          <div className="p-4 sm:p-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-base sm:text-lg">Order #{order.order_number}</h3>
                                  <Badge className={statusColors.delivered}>
                                    {statusLabels.delivered}
                                  </Badge>
                                  <Badge className={paymentStatusColors[order.payment_status] || "bg-gray-100"}>
                                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs sm:text-sm text-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Delivered: {order.delivered_at && formatOrderDate(order.delivered_at)}</span>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs sm:text-sm">
                                <div className="flex items-center gap-2">
                                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                                  <span className="font-medium break-words">{order.merchant?.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                                  <span className="font-medium break-words">{order.customer_addresses?.building_name}</span>
                                </div>
                                <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
                                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                                  <span className="break-words">
                                    {order.payment_method === "cash" ? "Cash" : "Online"} - 
                                    <span className={`ml-1 font-medium ${
                                      order.payment_status === 'paid' ? 'text-green-600' : 
                                      order.payment_status === 'failed' ? 'text-red-600' : 
                                      'text-yellow-600'
                                    }`}>
                                      {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                    </span>
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
                                <div className="text-center sm:text-left">
                                  <p className="text-lg sm:text-xl font-bold text-green-600">R{order.total_amount?.toFixed(2)}</p>
                                  <p className="text-xs sm:text-sm text-green-600 font-medium">
                                    Earned: R{runnerBaseFee.toFixed(2)}
                                  </p>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => navigate(`/order-details/${order.id}`)}
                                  className="flex items-center gap-2 w-full sm:w-auto justify-center"
                                >
                                  <User className="h-3 w-3" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
              
              {/* Notifications Tab */}
              <TabsContent value="notifications">
                <RunnerNotifications />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* PIN Verification Dialog for Delivery */}
      <PinVerificationDialog
        isOpen={showPinDialog}
        onClose={() => {
          setShowPinDialog(false);
          setSelectedOrderId(null);
        }}
        onVerify={handlePinVerification}
        isVerifying={isVerifyingPin}
      />
    </div>
  );
};

export default Dashboard;
