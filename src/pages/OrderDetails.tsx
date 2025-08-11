
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ShoppingBag, MapPin, User, Phone, CreditCard, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { CancelOrderDialog } from "@/components/CancelOrderDialog";
import { PinVerificationDialog } from "@/components/PinVerificationDialog";
import { PinDisplay } from "@/components/PinDisplay";
import { getRunnerBaseFee } from "@/lib/utils";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [order, setOrder] = useState<any | null>(null);
  const [customerInfo, setCustomerInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  
  // Status styling with modern colors
  const statusLabels = {
    pending: "Pending",
    ready: "Ready",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };
  
  const statusColors = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    ready: "bg-blue-50 text-blue-700 border-blue-200",
    picked_up: "bg-purple-50 text-purple-700 border-purple-200",
    in_transit: "bg-indigo-50 text-indigo-700 border-indigo-200",
    delivered: "bg-green-50 text-green-700 border-green-200",
    cancelled: "bg-red-50 text-red-700 border-red-200"
  };

  // Payment status styling
  const paymentStatusColors = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
    failed: "bg-red-50 text-red-700 border-red-200",
    refunded: "bg-blue-50 text-blue-700 border-blue-200"
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
            order_items (
              *,
              menu_item:menu_item_id (*)
            )
          `)
          .eq("id", id)
          .single();
        
        // Separately fetch delivery address if delivery_address_id exists
        let deliveryAddress = null;
        if (orderData?.delivery_address_id) {
          const { data: addressData } = await supabase
            .from("customer_addresses")
            .select("*")
            .eq("id", orderData.delivery_address_id)
            .single();
          deliveryAddress = addressData;
        }
        
        if (orderError) {
          console.error("Error fetching order:", orderError);
          setError(`Failed to load order: ${orderError.message}`);
          return;
        }
        
        console.log("Order data received:", orderData);
        
        if (orderData) {
          // Attach delivery address to order data
          const orderWithAddress = {
            ...orderData,
            customer_addresses: deliveryAddress
          };
          setOrder(orderWithAddress);
          
          // Fetch customer information if available
          if (orderData.customer_id) {
            console.log("Fetching customer data for ID:", orderData.customer_id);
            
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("*")
              .eq("id", orderData.customer_id)
              .single();
            
            if (userError) {
              console.error("Error fetching customer data:", userError);
            } else if (userData) {
              console.log("Customer data received:", userData);
              setCustomerInfo(userData);
            } else {
              console.log("No customer found with ID:", orderData.customer_id);
            }
          } else {
            console.log("No customer ID found in order data");
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
    
    // Check if payment is confirmed
    if (order.payment_status !== "paid") {
      toast({
        title: "Cannot accept order",
        description: "Orders can only be accepted after payment is confirmed",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsUpdating(true);
      
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
      
      // Update local state
      setOrder({
        ...order,
        status: "picked_up",
        runner_id: currentUser.id
      });
      
      toast({
        title: "Order accepted",
        description: "You have successfully accepted this order"
      });
    } catch (err: any) {
      console.error("Error accepting order:", err);
      toast({
        title: "Failed to accept order",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleMarkInTransit = async () => {
    if (!currentUser || !order) return;
    
    try {
      setIsUpdating(true);
      console.log("Marking order as in transit...");
      console.log("Order ID:", order.id);
      console.log("Current user ID:", currentUser.id);
      
      // Update the order status
      const { data, error: updateError } = await supabase
        .from("orders")
        .update({ status: "in_transit" })
        .eq("id", order.id)
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
        description: "Could not update order status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleMarkDelivered = () => {
    setShowPinDialog(true);
  };

  const handlePinVerification = async (enteredPin: string): Promise<boolean> => {
    if (!currentUser || !order) return false;
    
    try {
      setIsVerifyingPin(true);
      
      // Verify the PIN matches the order's delivery PIN
      if (enteredPin !== order.delivery_pin) {
        return false;
      }
      
      // If PIN is correct, proceed with delivery confirmation
      setIsUpdating(true);
      const now = new Date().toISOString();
      
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "delivered",
          delivered_at: now
        })
        .eq("id", order.id);
      
      if (updateError) throw updateError;
      
      // Add to order status history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: order.id,
          status: "delivered",
          changed_by: currentUser.id,
          notes: "Order successfully delivered with PIN verification"
        });
      
      if (historyError) {
        console.error("Error updating order history:", historyError);
      }
      
      // Create an earning record with configurable base fee
      const baseFee = await getRunnerBaseFee();
      const tipAmount = 0.00;
      const bonusAmount = 0.00;
      const totalEarned = baseFee + tipAmount + bonusAmount;
      
      const { error: earningsError } = await supabase.from("runner_earnings").insert({
        runner_id: currentUser.id,
        order_id: order.id,
        base_fee: baseFee,
        tip_amount: tipAmount,
        bonus_amount: bonusAmount,
        total_earned: totalEarned,
        payout_status: "pending"
      });
      
      if (earningsError) {
        console.error("Error creating earnings record:", earningsError);
      }
      
      // Update order in state
      setOrder({
        ...order,
        status: "delivered",
        delivered_at: now
      });
      
      return true;
    } catch (err: any) {
      console.error("Error marking order as delivered:", err);
      toast({
        title: "Update failed",
        description: "Could not mark order as delivered",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsUpdating(false);
      setIsVerifyingPin(false);
    }
  };

  const handleCancelOrder = async (reason: string) => {
    if (!currentUser || !order) return;
    
    try {
      setIsUpdating(true);
      const now = new Date().toISOString();
      
      console.log("Cancelling order:", order.id);
      console.log("Cancellation reason:", reason);
      
      // Update order status to cancelled
      const { error: updateError } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          cancelled_at: now,
          cancellation_reason: reason
        })
        .eq("id", order.id);
      
      if (updateError) {
        console.error("Error updating order status:", updateError);
        throw updateError;
      }
      
      // Add to order status history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: order.id,
          status: "cancelled",
          changed_by: currentUser.id,
          notes: `Order cancelled by runner. Reason: ${reason}`
        });
      
      if (historyError) {
        console.error("Error updating order history:", historyError);
      }
      
      // Process wallet refund if payment was successful
      if (order.payment_status === 'paid' && order.customer_id) {
        console.log("Processing wallet refund for customer:", order.customer_id);
        
        const { error: refundError } = await supabase.rpc('refund_wallet_credits', {
          p_user_id: order.customer_id,
          p_amount: order.total_amount,
          p_description: `Refund for cancelled order #${order.order_number}`,
          p_reference_id: order.id
        });
        
        if (refundError) {
          console.error("Error processing wallet refund:", refundError);
        } else {
          console.log("Wallet refund processed successfully");
        }
      }
      
      // Update local state
      setOrder({
        ...order,
        status: "cancelled",
        cancelled_at: now,
        cancellation_reason: reason
      });
      
      toast({
        title: "Order cancelled",
        description: "Order has been cancelled and customer has been refunded"
      });
      
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      toast({
        title: "Cancellation failed",
        description: "Could not cancel order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg text-muted-foreground">Loading order details...</p>
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
                <p className="text-lg font-medium text-red-600">Error Loading Order</p>
                <p className="text-muted-foreground">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                  className="mt-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md shadow-lg">
              <CardContent className="pt-6 text-center space-y-4">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-lg font-medium">Order Not Found</p>
                <p className="text-muted-foreground">The order you're looking for doesn't exist.</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/dashboard")}
                  className="mt-4"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container max-w-4xl mx-auto py-8 px-4 animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-6 pl-0 flex items-center gap-2 hover:bg-white/50 rounded-lg transition-colors"
            onClick={() => navigate("/dashboard")}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4 bg-gradient-to-r from-primary/5 to-blue-50 rounded-t-lg">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
                  <Badge className={`${statusColors[order.status as keyof typeof statusColors]} border font-medium px-3 py-1`}>
                    {statusLabels[order.status as keyof typeof statusLabels]}
                  </Badge>
                  <Badge className={`${paymentStatusColors[order.payment_status as keyof typeof paymentStatusColors] || "bg-gray-100 border-gray-200"} border font-medium px-3 py-1`}>
                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Unknown"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <p>Placed on {formatOrderDate(order.created_at)}</p>
                </div>
                {order.cancelled_at && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-700 font-medium">
                      Cancelled on {formatOrderDate(order.cancelled_at)}
                    </p>
                    {order.cancellation_reason && (
                      <p className="text-red-600 text-sm mt-1">
                        Reason: {order.cancellation_reason}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                {!order.runner_id && order.status === "ready" && (
                  <Button 
                    onClick={handleAcceptOrder} 
                    disabled={isUpdating}
                    className="bg-primary hover:bg-primary/90 shadow-md"
                    size="lg"
                  >
                    {isUpdating ? "Processing..." : "Accept Order"}
                  </Button>
                )}
                
                {order.runner_id && order.runner_id === currentUser?.id && order.status !== "cancelled" && order.status !== "delivered" && (
                  <>
                    {order.status === "picked_up" && (
                      <Button 
                        onClick={handleMarkInTransit} 
                        disabled={isUpdating}
                        className="bg-purple-600 hover:bg-purple-700 shadow-md"
                        size="lg"
                      >
                        {isUpdating ? "Processing..." : "Mark In Transit"}
                      </Button>
                    )}
                    
                    {(order.status === "in_transit" || order.status === "picked_up") && (
                      <Button 
                        onClick={handleMarkDelivered} 
                        disabled={isUpdating} 
                        className="bg-green-600 hover:bg-green-700 shadow-md"
                        size="lg"
                      >
                        {isUpdating ? "Processing..." : "Mark Delivered"}
                      </Button>
                    )}
                    
                    {(order.status === "picked_up" || order.status === "in_transit") && (
                      <CancelOrderDialog 
                        onCancel={handleCancelOrder}
                        isLoading={isUpdating}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-8 space-y-8">
            {/* Payment Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Information
              </h2>
              <div className={`rounded-xl p-6 border-2 ${
                order.payment_status === 'paid' ? 'bg-green-50 border-green-200' : 
                order.payment_status === 'failed' ? 'bg-red-50 border-red-200' : 
                order.payment_status === 'refunded' ? 'bg-blue-50 border-blue-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Method</p>
                    <p className="text-lg font-semibold">{order.payment_method === "cash" ? "Cash on Delivery" : "Online Payment"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Status</p>
                    <p className={`text-lg font-semibold ${
                      order.payment_status === 'paid' ? 'text-green-700' : 
                      order.payment_status === 'failed' ? 'text-red-700' : 
                      order.payment_status === 'refunded' ? 'text-blue-700' :
                      'text-yellow-700'
                    }`}>
                      {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Amount</p>
                    <p className="text-2xl font-bold text-gray-900">R{(order.total_amount || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                {order.payment_method === "cash" && order.status !== "cancelled" && (
                  <div className="mt-4 p-4 bg-amber-100 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">Cash Collection Required</p>
                        <p className="text-amber-700 text-sm">Remember to collect R{(order.total_amount || 0).toFixed(2)} in cash from the customer.</p>
                      </div>
                    </div>
                  </div>
                )}

                {order.status === "cancelled" && order.payment_status === 'paid' && (
                  <div className="mt-4 p-4 bg-blue-100 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-blue-800">Refund Processed</p>
                        <p className="text-blue-700 text-sm">Customer has been automatically refunded to their wallet.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator className="my-8" />
            
            {/* Delivery PIN Display - for customers */}
            {order.delivery_pin && currentUser?.id === order.customer_id && (
              <div className="space-y-4">
                <PinDisplay pin={order.delivery_pin} orderNumber={order.order_number} />
              </div>
            )}

            {order.delivery_pin && currentUser?.id === order.customer_id && <Separator className="my-8" />}
            
            {/* Customer Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Customer Information
              </h2>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                {customerInfo ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Full Name</p>
                        <p className="text-lg font-semibold text-gray-900">{customerInfo.full_name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Email</p>
                        <p className="text-gray-700">{customerInfo.email}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {customerInfo.phone_number && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Phone</p>
                          <div className="flex items-center gap-2">
                            <p className="text-gray-700">{customerInfo.phone_number}</p>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(`tel:${customerInfo.phone_number}`, '_blank')}
                              className="h-8"
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              Call
                            </Button>
                          </div>
                        </div>
                      )}
                      {customerInfo.student_number && (
                        <div>
                          <p className="text-sm font-medium text-gray-600">Student Number</p>
                          <p className="text-gray-700">{customerInfo.student_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {order.customer_id ? "Loading customer information..." : "No customer information available"}
                  </p>
                )}
              </div>
            </div>

            <Separator className="my-8" />
            
            {/* Location Information */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pickup Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  Pickup Location
                </h2>
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Restaurant</p>
                      <p className="text-lg font-semibold text-gray-900">{order.merchant?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Address</p>
                      <p className="text-gray-700">{order.merchant?.location}</p>
                    </div>
                    {order.merchant?.contact_phone && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Contact</p>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-700">{order.merchant.contact_phone}</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(`tel:${order.merchant.contact_phone}`, '_blank')}
                            className="h-8"
                          >
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Delivery Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Delivery Location
                </h2>
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Building & Room</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}
                      </p>
                    </div>
                    {order.customer_addresses?.full_address && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Full Address</p>
                        <p className="text-gray-700">{order.customer_addresses.full_address}</p>
                      </div>
                    )}
                    {order.customer_addresses?.delivery_instructions && (
                      <div>
                        <p className="text-sm font-medium text-gray-600">Special Instructions</p>
                        <p className="text-gray-700 italic">{order.customer_addresses.delivery_instructions}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-8" />
            
            {/* Order Items */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Order Items
              </h2>
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="space-y-4">
                  {order.order_items && order.order_items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-start p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-lg">
                          {item.quantity}× {item.menu_item?.name || "Item"}
                        </p>
                        {item.special_requests && (
                          <p className="text-sm text-gray-600 mt-1 italic">
                            Special request: {item.special_requests}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-lg text-gray-900">R{(item.total_price || 0).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <Separator className="my-6" />
                
                {/* Order Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>R{(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>R{(order.delivery_fee || 0).toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>R{(order.total_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PIN Verification Dialog */}
        <PinVerificationDialog
          isOpen={showPinDialog}
          onClose={() => setShowPinDialog(false)}
          onVerify={handlePinVerification}
          isVerifying={isVerifyingPin}
        />
      </div>
    </div>
  );
};

export default OrderDetails;
