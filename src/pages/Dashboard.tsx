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
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

// Define the types based on the database schema and actual returned data
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
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  
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
          // Updated to include both 'ready' and 'pending' status orders that are not assigned to runners
          console.log("Querying available orders: status in [ready, pending], runner_id=null");
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
      console.log("Number of orders:", data?.length || 0);
      
      // Debugging any data issues
      if (data && data.length > 0) {
        console.log("Sample order data:", data[0]);
      } else {
        console.log("No orders found for the current query");
        
        // If no orders found, check if there are any "ready" or "pending" orders regardless of runner_id
        if (activeTab === "available") {
          const { data: availableOrders } = await supabase
            .from("orders")
            .select("id, status, runner_id")
            .in("status", ["ready", "pending"]);
            
          console.log("All ready/pending orders:", availableOrders);
        }
      }
      
      // Type assertion to match the Order interface
      setOrders(data as Order[]);
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
  
  // Handle order acceptance
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
      // Update order status and assign runner
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "picked_up",
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
          notes: "Order picked up by runner"
        });
      
      if (historyError) {
        console.error("Error updating order history:", historyError);
      }
      
      toast({
        title: "Order accepted",
        description: "You have successfully accepted this order"
      });
      
      // Switch to active tab
      setActiveTab("active");
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
  
  const handleMarkDelivered = async (orderId: string) => {
    if (!currentUser) return;
    
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
        const baseFee = 15.00; // Base delivery fee
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
    } catch (err) {
      console.error("Error marking order as delivered:", err);
      toast({
        title: "Update failed",
        description: "Could not mark order as delivered",
        variant: "destructive"
      });
      setIsUpdatingOrder(false);
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
  }, [currentUser]);
  
  const handleManualRefresh = () => {
    fetchOrders();
    fetchEarnings();
    toast({
      title: "Refreshing data",
      description: "Fetching the latest order and earnings data",
    });
  };
  
  // Calculate counts for each order status
  const activeOrdersCount = orders.filter(order => 
    order.status === "picked_up" || order.status === "in_transit").length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container py-8 space-y-8 animate-fade-in">
        {/* Enhanced Header & User Info */}
        <div className="rounded-2xl border bg-white/80 backdrop-blur-sm shadow-xl p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Runner Dashboard
                </h1>
              </div>
              <p className="text-lg text-muted-foreground">
                Manage your deliveries, track orders and maximize your earnings
              </p>
              {currentUser && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="p-1.5 bg-blue-100 rounded-full">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-800">{currentUser.email}</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                    Active Runner
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center space-x-3 bg-gradient-to-r from-white to-gray-50 p-4 rounded-xl border shadow-sm">
                <Switch 
                  id="runner-status" 
                  checked={isAvailable} 
                  onCheckedChange={handleStatusChange}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label 
                  htmlFor="runner-status" 
                  className={`font-semibold ${isAvailable ? "text-green-600" : "text-red-500"}`}
                >
                  {isAvailable ? (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Available for Orders
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Unavailable
                    </div>
                  )}
                </Label>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
              >
                <User className="h-4 w-4" />
                Profile Settings
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <ArrowRightCircle className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">{activeOrdersCount}</p>
                    <p className="text-blue-100 text-sm font-medium">Active Orders</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-blue-200" />
                  <span className="text-blue-100">Orders in progress</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">R{earnings.today.amount.toFixed(2)}</p>
                    <p className="text-green-100 text-sm font-medium">Today's Earnings</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <WalletCards className="h-4 w-4 text-green-200" />
                  <span className="text-green-100">{earnings.today.count} deliveries today</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">R{earnings.total.amount.toFixed(2)}</p>
                    <p className="text-purple-100 text-sm font-medium">Total Earnings</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-purple-200" />
                  <span className="text-purple-100">{earnings.total.count} total deliveries</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Enhanced Orders Tabs */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-0 bg-gradient-to-r from-white to-gray-50 rounded-t-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-2xl text-gray-800">Order Management</CardTitle>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                className="flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-600 hover:text-blue-700 transition-all duration-200"
              >
                <RefreshCcw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-8 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="available" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Available</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="active" 
                  className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRightCircle className="h-4 w-4" />
                    <span className="font-medium">Active</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="data-[state=active]:bg-white data-[state=active]:text-green-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Completed</span>
                  </div>
                </TabsTrigger>
              </TabsList>
              
              {/* Available Orders Tab */}
              <TabsContent value="available">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">Available Orders</h2>
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                      {orders.length} orders
                    </Badge>
                  </div>
                
                  {isLoading && (
                    <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-white rounded-2xl border">
                      <div className="animate-pulse flex flex-col items-center">
                        <div className="h-16 w-16 bg-blue-200 rounded-full mb-6 animate-bounce"></div>
                        <div className="h-6 w-40 bg-blue-100 rounded-full mb-4"></div>
                        <div className="h-4 w-32 bg-gray-100 rounded-full"></div>
                      </div>
                    </div>
                  )}
                
                  {error && (
                    <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
                      <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                      <p className="text-red-600 font-semibold text-lg">{error}</p>
                    </div>
                  )}
                
                  {!isLoading && !error && orders.length === 0 ? (
                    <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border">
                      <ShoppingBag className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No available orders</h3>
                      <p className="text-gray-500 mb-6">
                        Check back soon for new delivery opportunities
                      </p>
                      <Button 
                        onClick={handleManualRefresh}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                      >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        Refresh Orders
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {orders.map(order => (
                        <Card key={order.id} className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-white">
                          <CardContent className="p-0">
                            <div className="p-8">
                              <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <h3 className="font-bold text-xl text-gray-800">Order #{order.order_number}</h3>
                                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 px-3 py-1">
                                      {statusLabels[order.status]}
                                    </Badge>
                                    <Badge className={`px-3 py-1 ${paymentStatusColors[order.payment_status] || "bg-gray-100"}`}>
                                      {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-gray-600 mb-6">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">{formatOrderDate(order.created_at)}</span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div className="space-y-3">
                                      <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                                        <MapPin className="w-5 h-5 mt-1 text-purple-600" />
                                        <div>
                                          <p className="font-semibold text-gray-800">Delivery to:</p>
                                          <p className="text-gray-700">{order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {order.order_items && order.order_items.length > 0 && (
                                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border">
                                      <p className="font-semibold mb-3 text-gray-800">Order items:</p>
                                      <ul className="space-y-2">
                                        {order.order_items.map((item, index) => (
                                          <li key={index} className="flex items-center gap-3">
                                            <span className="bg-blue-600 text-white text-xs rounded-full px-3 py-1 font-bold">
                                              {item.quantity}x
                                            </span>
                                            <span className="text-gray-700 font-medium">{item.menu_item?.name}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex flex-col items-end justify-between min-w-48">
                                  <div className="text-right mb-6">
                                    <p className="text-3xl font-bold text-green-600 mb-1">R{order.total_amount?.toFixed(2)}</p>
                                    <p className="text-gray-500">Total amount</p>
                                    <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                                      <p className="text-green-700 font-semibold text-sm">You'll earn: R15.00</p>
                                    </div>
                                  </div>
                                  <Button 
                                    onClick={() => handleAcceptOrder(order.id)}
                                    size="lg"
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
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
                <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
                
                {isLoading && (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-12 w-12 bg-purple-100 rounded-full mb-4"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
                      <div className="h-3 w-24 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 font-medium">{error}</p>
                  </div>
                )}
                
                {!isLoading && !error && orders.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <ArrowRightCircle className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-muted-foreground font-medium">No active orders</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Orders you accept will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Card key={order.id} className="hover:border-purple-200 transition-colors border-l-4 border-l-purple-500">
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                                  <Badge className={statusColors[order.status]}>
                                    {statusLabels[order.status]}
                                  </Badge>
                                  <Badge className={paymentStatusColors[order.payment_status] || "bg-gray-100"}>
                                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatOrderDate(order.created_at)}</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-md">
                                      <ShoppingBag className="w-5 h-5 mt-0.5 text-blue-600" />
                                      <div>
                                        <p className="font-medium">Pickup from:</p>
                                        <p className="text-sm font-semibold">{order.merchant?.name}</p>
                                        <p className="text-sm text-muted-foreground">{order.merchant?.location}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-md">
                                      <MapPin className="w-5 h-5 mt-0.5 text-purple-600" />
                                      <div>
                                        <p className="font-medium">Deliver to:</p>
                                        <p className="text-sm font-semibold">{order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}</p>
                                        {order.customer_addresses?.delivery_instructions && (
                                          <p className="text-sm text-muted-foreground mt-1">
                                            Note: {order.customer_addresses.delivery_instructions}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-md">
                                      <CreditCard className="w-5 h-5 mt-0.5 text-green-600" />
                                      <div>
                                        <p className="font-medium">Payment Details:</p>
                                        <p className="text-sm">{order.payment_method === "cash" ? "Cash on Delivery" : "Online Payment"}</p>
                                        <p className={`text-sm font-medium ${
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
                              </div>
                              
                              <div className="mt-6 md:mt-0 flex flex-col items-end space-y-3">
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-purple-600">R{order.total_amount?.toFixed(2)}</p>
                                  <p className="text-sm text-muted-foreground">Total amount</p>
                                </div>
                                
                                <div className="flex flex-col gap-2">
                                  {order.status === "picked_up" && (
                                    <Button 
                                      onClick={() => handleMarkInTransit(order.id)}
                                      size="lg"
                                      className="bg-purple-600 hover:bg-purple-700 text-white px-6"
                                    >
                                      Mark In Transit
                                    </Button>
                                  )}
                                  
                                  {order.status === "in_transit" && (
                                    <Button 
                                      onClick={() => handleMarkDelivered(order.id)}
                                      size="lg"
                                      className="bg-green-600 hover:bg-green-700 text-white px-6"
                                    >
                                      Mark Delivered
                                    </Button>
                                  )}
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => navigate(`/order-details/${order.id}`)}
                                    className="flex items-center gap-2"
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
                <h2 className="text-xl font-semibold mb-4">Completed Orders</h2>
                
                {isLoading && (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <div className="animate-pulse flex flex-col items-center">
                      <div className="h-12 w-12 bg-green-100 rounded-full mb-4"></div>
                      <div className="h-4 w-32 bg-gray-200 rounded mb-3"></div>
                      <div className="h-3 w-24 bg-gray-100 rounded"></div>
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 font-medium">{error}</p>
                  </div>
                )}
                
                {!isLoading && !error && orders.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-lg border">
                    <CheckCircle2 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-muted-foreground font-medium">No completed orders yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Orders you've delivered will appear here
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Card key={order.id} className="hover:border-green-200 transition-colors border-l-4 border-l-green-500">
                        <CardContent className="p-0">
                          <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                  <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                                  <Badge className={statusColors.delivered}>
                                    {statusLabels.delivered}
                                  </Badge>
                                  <Badge className={paymentStatusColors[order.payment_status] || "bg-gray-100"}>
                                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-green-600 mb-3">
                                  <CheckCircle2 className="h-3 w-3" />
                                  <span>Delivered: {order.delivered_at && formatOrderDate(order.delivered_at)}</span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                  <div className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4 text-blue-500" />
                                    <span className="font-medium">{order.merchant?.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-purple-500" />
                                    <span className="font-medium">{order.customer_addresses?.building_name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-green-500" />
                                    <span>
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
                              </div>
                              <div className="mt-6 md:mt-0 flex flex-col items-end space-y-2">
                                <div className="text-right">
                                  <p className="text-xl font-bold text-green-600">R{order.total_amount?.toFixed(2)}</p>
                                  <p className="text-sm text-green-600 font-medium">
                                    Earned: R15.00
                                  </p>
                                </div>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => navigate(`/order-details/${order.id}`)}
                                  className="flex items-center gap-2"
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
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
