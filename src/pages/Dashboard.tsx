import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingBag, Phone, User, RefreshCcw, CreditCard } from "lucide-react";
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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
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
    if (!currentUser) return;
    
    try {
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);
      
      console.log("Fetching orders for tab:", activeTab);
      console.log("Current user ID:", currentUser.id);
      
      // First, check if there are any orders in the table at all
      const { count: totalOrdersCount, error: countError } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
        
      if (countError) {
        console.error("Error counting total orders:", countError);
        setDebugInfo(`Error counting orders: ${countError.message || JSON.stringify(countError)}`);
      } else {
        console.log("Total orders in database:", totalOrdersCount);
        setDebugInfo(`Total orders in database: ${totalOrdersCount || 0}`);
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
        setDebugInfo(prevInfo => `${prevInfo || ''}\nQuery error: ${fetchError.message || JSON.stringify(fetchError)}`);
        throw fetchError;
      }
      
      console.log("Orders fetched:", data);
      console.log("Number of orders:", data?.length || 0);
      
      // Debugging any data issues
      if (data && data.length > 0) {
        console.log("Sample order data:", data[0]);
        setDebugInfo(prevInfo => `${prevInfo || ''}\nOrders found for current tab: ${data.length}`);
      } else {
        console.log("No orders found for the current query");
        setDebugInfo(prevInfo => `${prevInfo || ''}\nNo orders found matching the query criteria. Check if orders have status="pending" or "ready" and runner_id=null (for available tab).`);
        
        // If no orders found, check if there are any "ready" or "pending" orders regardless of runner_id
        if (activeTab === "available") {
          const { data: availableOrders } = await supabase
            .from("orders")
            .select("id, status, runner_id")
            .in("status", ["ready", "pending"]);
            
          console.log("All ready/pending orders:", availableOrders);
          setDebugInfo(prevInfo => `${prevInfo || ''}\nAll orders with status="ready" or "pending": ${availableOrders?.length || 0}`);
          
          if (availableOrders && availableOrders.length > 0) {
            setDebugInfo(prevInfo => `${prevInfo || ''}\nNote: There are ready/pending orders, but they may already be assigned to runners.`);
          }
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
      const { data: earningsData, error: earningsError } = await supabase
        .from("runner_earnings")
        .select("*")
        .eq("runner_id", currentUser.id);
      
      if (earningsError) throw earningsError;
      
      // Calculate summary
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0);
      
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const summary = {
        today: { count: 0, amount: 0 },
        weekly: { count: 0, amount: 0 },
        monthly: { count: 0, amount: 0 },
        total: { count: earningsData?.length || 0, amount: 0 }
      };
      
      earningsData?.forEach(earning => {
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
      
      setEarnings(summary);
    } catch (err) {
      console.error("Error fetching earnings:", err);
      // Don't set an error message for earnings to avoid cluttering the UI
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
        // Continue anyway as this is not critical
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
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "in_transit"
        })
        .eq("id", orderId)
        .eq("runner_id", currentUser.id);
      
      if (updateError) {
        console.error("Error updating order status:", updateError);
        toast({
          title: "Update failed",
          description: `Could not update order status: ${updateError.message}`,
          variant: "destructive"
        });
        throw updateError;
      }
      
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
      
      fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
      toast({
        title: "Update failed",
        description: "Could not update order status. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkDelivered = async (orderId: string) => {
    if (!currentUser) return;
    
    try {
      const now = new Date().toISOString();
      
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
      
      // Create an earning record
      const { data: orderData } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("id", orderId)
        .single();
      
      if (orderData) {
        const baseFee = 15.00; // Example base fee, adjust based on your logic
        
        await supabase.from("runner_earnings").insert({
          runner_id: currentUser.id,
          order_id: orderId,
          base_fee: baseFee,
          total_earned: baseFee,
          payout_status: "pending"
        });
      }
      
      toast({
        title: "Order delivered",
        description: "Order has been successfully delivered"
      });
      
      fetchOrders();
      fetchEarnings();
    } catch (err) {
      console.error("Error marking order as delivered:", err);
      toast({
        title: "Update failed",
        description: "Could not mark order as delivered",
        variant: "destructive"
      });
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
          fetchOrders();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [currentUser, activeTab]);
  
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
    toast({
      title: "Refreshing orders",
      description: "Fetching the latest order data",
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6 animate-fade-in">
        {/* Header & Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Runner Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your deliveries, track orders and earnings
              </p>
              {currentUser && (
                <p className="text-sm mt-2">Logged in as: {currentUser.email}</p>
              )}
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="runner-status" 
                  checked={isAvailable} 
                  onCheckedChange={handleStatusChange}
                />
                <Label htmlFor="runner-status">
                  {isAvailable ? "Available" : "Unavailable"}
                </Label>
              </div>
              
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Profile Settings
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active Orders</p>
                  <p className="text-2xl font-bold">
                    {
                      activeTab === "active" 
                        ? orders.length 
                        : orders.filter(order => 
                            order.status === "picked_up" || order.status === "in_transit"
                          ).length
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Today's Earnings</p>
                  <p className="text-2xl font-bold">R{earnings.today.amount.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Earnings</p>
                  <p className="text-2xl font-bold">R{earnings.total.amount.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList className="grid grid-cols-3 md:w-[400px]">
              <TabsTrigger value="available">Available</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleManualRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
          
          {/* Available Orders Tab */}
          <TabsContent value="available">
            <h2 className="text-xl font-semibold mb-4">Available Orders</h2>
            
            {isLoading && (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p>Loading orders...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-6 bg-white rounded-lg border">
                <p className="text-red-500">{error}</p>
                {debugInfo && (
                  <div className="mt-4 p-4 bg-gray-50 rounded text-left text-sm text-gray-700">
                    <p className="font-semibold">Debug information:</p>
                    <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                  </div>
                )}
              </div>
            )}
            
            {!isLoading && !error && orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-muted-foreground">No available orders at the moment</p>
                <p className="text-sm text-muted-foreground mt-2">
                  This could be because there are no orders with status "ready" or "pending" and null runner_id
                </p>
                {debugInfo && (
                  <div className="mt-4 p-4 bg-gray-50 rounded text-left text-sm text-gray-700">
                    <p className="font-semibold">Debug information:</p>
                    <pre className="whitespace-pre-wrap">{debugInfo}</pre>
                  </div>
                )}
                <Button 
                  className="mt-4" 
                  variant="outline" 
                  onClick={handleManualRefresh}
                >
                  Refresh Orders
                </Button>
              </div>
            ) : (
              <div>
                {orders.map(order => (
                  <Card key={order.id} className="mb-4">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            <Badge className={statusColors[order.status]}>
                              {statusLabels[order.status]}
                            </Badge>
                            <Badge className={paymentStatusColors[order.payment_status] || "bg-gray-100"}>
                              {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {formatOrderDate(order.created_at)}
                          </p>
                          <div className="space-y-1 mb-4">
                            <div className="flex items-start gap-2">
                              <ShoppingBag className="w-4 h-4 mt-1" />
                              <div>
                                <p className="font-medium">{order.merchant?.name}</p>
                                <p className="text-sm text-muted-foreground">{order.merchant?.location}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-1" />
                              <div>
                                <p className="font-medium">Delivery to:</p>
                                <p className="text-sm">{order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CreditCard className="w-4 h-4 mt-1" />
                              <div>
                                <p className="text-sm">
                                  <span className="font-medium">Payment:</span> {order.payment_method === "cash" ? "Cash on Delivery" : "Online Payment"} - 
                                  <span className={
                                    order.payment_status === 'paid' ? ' text-green-600 font-medium' : 
                                    order.payment_status === 'failed' ? ' text-red-600 font-medium' : 
                                    ' text-yellow-600 font-medium'
                                  }>
                                    {' '}{order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                          {order.order_items && order.order_items.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-1">Order items:</p>
                              <ul className="text-sm list-disc pl-5">
                                {order.order_items.map((item, index) => (
                                  <li key={index}>{item.quantity}x {item.menu_item?.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col items-end">
                          <p className="font-medium text-lg mb-4">R{order.total_amount?.toFixed(2)}</p>
                          <Button onClick={() => handleAcceptOrder(order.id)}>
                            Accept Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Active Orders Tab */}
          <TabsContent value="active">
            <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
            
            {isLoading && (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p>Loading orders...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            {!isLoading && !error && orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-muted-foreground">No active orders</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Orders you accept will appear here
                </p>
              </div>
            ) : (
              <div>
                {orders.map(order => (
                  <Card key={order.id} className="mb-4">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            <Badge className={statusColors[order.status]}>
                              {statusLabels[order.status]}
                            </Badge>
                            <Badge className={paymentStatusColors[order.payment_status] || "bg-gray-100"}>
                              {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {formatOrderDate(order.created_at)}
                          </p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2">
                              <ShoppingBag className="w-4 h-4 mt-1" />
                              <div>
                                <p className="font-medium">{order.merchant?.name}</p>
                                <p className="text-sm text-muted-foreground">{order.merchant?.location}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-1" />
                              <div>
                                <p className="font-medium">Delivery to:</p>
                                <p className="text-sm">{order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}</p>
                                {order.customer_addresses?.delivery_instructions && (
                                  <p className="text-sm text-muted-foreground">
                                    Note: {order.customer_addresses.delivery_instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <CreditCard className="w-4 h-4 mt-1" />
                              <div>
                                <p className="text-sm">
                                  <span className="font-medium">Payment:</span> {order.payment_method === "cash" ? "Cash on Delivery" : "Online Payment"} - 
                                  <span className={
                                    order.payment_status === 'paid' ? ' text-green-600 font-medium' : 
                                    order.payment_status === 'failed' ? ' text-red-600 font-medium' : 
                                    ' text-yellow-600 font-medium'
                                  }>
                                    {' '}{order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                  </span>
                                  {order.payment_method === "cash" && (
                                    <span className="block text-yellow-600">
                                      Remember to collect R{order.total_amount?.toFixed(2)} from customer
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col items-end">
                          <p className="font-medium text-lg mb-4">R{order.total_amount?.toFixed(2)}</p>
                          
                          {order.status === "picked_up" && (
                            <Button onClick={() => handleMarkInTransit(order.id)}>
                              Mark In Transit
                            </Button>
                          )}
                          
                          {order.status === "in_transit" && (
                            <Button onClick={() => handleMarkDelivered(order.id)}>
                              Mark Delivered
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => navigate(`/order-details/${order.id}`)}
                          >
                            View Details
                          </Button>
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
                <p>Loading orders...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-red-500">{error}</p>
              </div>
            )}
            
            {!isLoading && !error && orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-muted-foreground">No completed orders yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Orders you've delivered will appear here
                </p>
              </div>
            ) : (
              <div>
                {orders.map(order => (
                  <Card key={order.id} className="mb-4">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            <Badge className={statusColors.delivered}>
                              {statusLabels.delivered}
                            </Badge>
                            <Badge className={paymentStatusColors[order.payment_status] || "bg-gray-100"}>
                              {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Delivered: {order.delivered_at && formatOrderDate(order.delivered_at)}
                          </p>
                          <div className="space-y-1 mt-3">
                            <div className="flex items-start gap-2">
                              <ShoppingBag className="w-4 h-4 mt-1" />
                              <p className="font-medium">{order.merchant?.name}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-1" />
                              <p className="font-medium">{order.customer_addresses?.building_name}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <CreditCard className="w-4 h-4 mt-1" />
                              <p className="text-sm">
                                {order.payment_method === "cash" ? "Cash on Delivery" : "Online Payment"} - 
                                <span className={
                                  order.payment_status === 'paid' ? ' text-green-600 font-medium' : 
                                  order.payment_status === 'failed' ? ' text-red-600 font-medium' : 
                                  ' text-yellow-600 font-medium'
                                }>
                                  {' '}{order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col items-end">
                          <p className="font-medium text-lg mb-4">R{order.total_amount?.toFixed(2)}</p>
                          <p className="text-sm text-green-600 font-medium">
                            Earned: R15.00
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => navigate(`/order-details/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
