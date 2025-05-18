
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ShoppingBag, MapPin, User, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [order, setOrder] = useState<any | null>(null);
  const [customerInfo, setCustomerInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  // Format dates helper function
  const formatOrderDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };
  
  // Fetch order data
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        console.log("Fetching order details for ID:", id);
        
        // Fetch the order with all related data
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select(`
            *,
            merchant:merchant_id (*),
            customer_addresses:delivery_address_id (*),
            order_items (
              *,
              menu_item:menu_item_id (*)
            )
          `)
          .eq("id", id)
          .single();
        
        if (orderError) {
          console.error("Error fetching order:", orderError);
          setError(`Failed to load order: ${orderError.message}`);
          return;
        }
        
        console.log("Order data received:", orderData);
        
        if (orderData) {
          setOrder(orderData);
          
          // Fetch customer information if available
          if (orderData.customer_id) {
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq("id", orderData.customer_id)
              .single();
            
            if (!userError && userData) {
              setCustomerInfo(userData);
            } else {
              console.log("Could not fetch customer data or no customer found");
            }
          }
        } else {
          setError("Order not found");
        }
      } catch (err: any) {
        console.error("Error in fetchOrderDetails:", err);
        setError(`An unexpected error occurred: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id]);

  // Order action handlers
  const handleAcceptOrder = async () => {
    if (!currentUser || !order) return;
    
    try {
      // Update order status and assign runner
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "picked_up",
          runner_id: currentUser.id
        })
        .eq("id", order.id);
      
      if (updateError) throw updateError;
      
      // Add to order status history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: order.id,
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
      
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Error accepting order:", err);
      toast({
        title: "Failed to accept order",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkInTransit = async () => {
    if (!currentUser || !order) return;
    
    try {
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "in_transit"
        })
        .eq("id", order.id)
        .eq("runner_id", currentUser.id);
      
      if (updateError) throw updateError;
      
      // Add to order status history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: order.id,
          status: "in_transit",
          changed_by: currentUser.id,
          notes: "Order in transit to delivery location"
        });
      
      if (historyError) {
        console.error("Error updating order history:", historyError);
      }
      
      // Update order in state
      setOrder({
        ...order,
        status: "in_transit"
      });
      
      toast({
        title: "Order updated",
        description: "Order marked as in transit"
      });
    } catch (err: any) {
      console.error("Error updating order:", err);
      toast({
        title: "Update failed",
        description: "Could not update order status",
        variant: "destructive"
      });
    }
  };
  
  const handleMarkDelivered = async () => {
    if (!currentUser || !order) return;
    
    try {
      const now = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          delivered_at: now
        })
        .eq("id", order.id)
        .eq("runner_id", currentUser.id);
      
      if (updateError) throw updateError;
      
      // Add to order status history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: order.id,
          status: "delivered",
          changed_by: currentUser.id,
          notes: "Order successfully delivered"
        });
      
      if (historyError) {
        console.error("Error updating order history:", historyError);
      }
      
      // Create an earning record
      const baseFee = 15.00; // Example base fee
      
      await supabase.from("runner_earnings").insert({
        runner_id: currentUser.id,
        order_id: order.id,
        base_fee: baseFee,
        total_earned: baseFee,
        payout_status: "pending"
      });
      
      // Update order in state
      setOrder({
        ...order,
        status: "delivered",
        delivered_at: now
      });
      
      toast({
        title: "Order delivered",
        description: "Order has been successfully delivered"
      });
    } catch (err: any) {
      console.error("Error marking order as delivered:", err);
      toast({
        title: "Update failed",
        description: "Could not mark order as delivered",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <div className="container py-8">
        <p>Loading order details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container py-8">
        <p className="text-red-500">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="container py-8">
        <p>Order not found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-8 animate-fade-in">
      <Button
        variant="ghost"
        className="mb-6 pl-0 flex items-center gap-2"
        onClick={() => navigate("/dashboard")}
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">Order #{order.order_number}</h1>
                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Placed on {formatOrderDate(order.created_at)}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              {!order.runner_id && order.status === "ready" && (
                <Button onClick={handleAcceptOrder}>
                  Accept Order
                </Button>
              )}
              
              {order.runner_id && order.runner_id === currentUser?.id && (
                <>
                  {order.status === "picked_up" && (
                    <Button onClick={handleMarkInTransit}>
                      Mark In Transit
                    </Button>
                  )}
                  
                  {order.status === "in_transit" && (
                    <Button onClick={handleMarkDelivered}>
                      Mark Delivered
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6">
          {/* Pickup Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Pickup Information</h2>
            <div className="bg-muted/50 rounded-md p-4">
              <div className="flex items-start space-x-3">
                <ShoppingBag className="h-5 w-5 mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">{order.merchant?.name}</p>
                  <p className="text-sm">{order.merchant?.location}</p>
                  {order.merchant?.contact_phone && (
                    <p className="text-sm flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {order.merchant.contact_phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Delivery Information */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Delivery Information</h2>
            <div className="bg-muted/50 rounded-md p-4">
              <div className="flex items-start space-x-3 mb-4">
                <MapPin className="h-5 w-5 mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="font-medium">{order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}</p>
                  {order.customer_addresses?.full_address && (
                    <p className="text-sm">{order.customer_addresses.full_address}</p>
                  )}
                  {order.customer_addresses?.delivery_instructions && (
                    <p className="text-sm text-muted-foreground">
                      Note: {order.customer_addresses.delivery_instructions}
                    </p>
                  )}
                </div>
              </div>
              
              {customerInfo && (
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">{customerInfo.full_name}</p>
                    {customerInfo.phone_number && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`tel:${customerInfo.phone_number}`, '_blank')}
                      >
                        <Phone className="h-3 w-3 mr-1" />
                        Call Customer
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Order Items</h2>
            <div className="bg-muted/50 rounded-md p-4">
              <div className="space-y-3">
                {order.order_items && order.order_items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {item.quantity}x {item.menu_item?.name || "Item"}
                      </p>
                      {item.special_requests && (
                        <p className="text-sm text-muted-foreground">
                          Note: {item.special_requests}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">R{(item.total_price || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R{(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>R{(order.delivery_fee || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2">
                  <span>Total</span>
                  <span>R{(order.total_amount || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment Information */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Payment Information</h2>
            <div className="bg-muted/50 rounded-md p-4">
              <p>
                <strong>Method:</strong> {order.payment_method === "cash" ? "Cash on Delivery" : "Online Payment"}
              </p>
              <p>
                <strong>Status:</strong> {order.payment_status ? (order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)) : "Pending"}
              </p>
              
              {order.payment_method === "cash" && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-100 rounded-md text-sm text-yellow-800">
                  Remember to collect R{(order.total_amount || 0).toFixed(2)} in cash from the customer.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetails;
