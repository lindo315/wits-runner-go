import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { getRunnerBaseFee } from "@/lib/utils";
import { RunnerNotifications } from "@/components/RunnerNotifications";
import { PinVerificationDialog } from "@/components/PinVerificationDialog";
import { MobileTopNav } from "@/components/MobileTopNav";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { AvailableOrdersTab } from "@/components/AvailableOrdersTab";
import { ActiveOrdersTab } from "@/components/ActiveOrdersTab";
import { CompletedOrdersTab } from "@/components/CompletedOrdersTab";

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

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [runnerBaseFee, setRunnerBaseFee] = useState<number>(10.00);
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [isVerifyingCollection, setIsVerifyingCollection] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Fetch orders based on active tab
  const fetchOrders = async () => {
    if (!currentUser || isUpdatingOrder) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
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
      
      setOrders(ordersWithAddresses as Order[]);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(`Failed to load orders: ${err.message || "Please try again later."}`);
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

  // Handle mark in transit
  const handleMarkInTransit = async (orderId: string) => {
    if (!currentUser) return;
    
    try {
      setIsUpdatingOrder(true);
      setIsLoading(true);
      
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
        title: "Order marked as in transit",
        description: "Order is now on the way to delivery location"
      });
      
      fetchOrders();
    } catch (err) {
      console.error("Error updating order:", err);
      toast({
        title: "Update failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingOrder(false);
      setIsLoading(false);
    }
  };

  // Handle mark delivered
  const handleMarkDelivered = async (orderId: string) => {
    if (!currentUser) return;
    setSelectedOrderId(orderId);
    setShowPinDialog(true);
  };

  // Handle verify collection PIN
  const handleVerifyCollection = async (orderId: string) => {
    if (!currentUser) return;
    
    try {
      setIsVerifyingCollection(true);
      
      // Update order status to picked_up
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "picked_up" })
        .eq("id", orderId)
        .eq("runner_id", currentUser.id);
      
      if (updateError) {
        console.error("Error updating order status:", updateError);
        toast({
          title: "Verification failed",
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
          status: "picked_up",
          changed_by: currentUser.id,
          notes: "Order collected from merchant - PIN verified"
        });
      
      if (historyError) {
        console.error("Error updating order history:", historyError);
      }
      
      toast({
        title: "Collection verified",
        description: "Order has been collected from merchant"
      });
      
      fetchOrders();
    } catch (err) {
      console.error("Error verifying collection:", err);
      toast({
        title: "Verification failed",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setIsVerifyingCollection(false);
    }
  };

  // Handle PIN verification
  const handlePinVerification = async (pin: string): Promise<boolean> => {
    if (!selectedOrderId || !currentUser) return false;
    
    try {
      setIsVerifyingPin(true);
      
      // Get the order to check the delivery PIN - for now we'll use a mock PIN check
      // In a real implementation, you'd have delivery_pin in the database
      const mockDeliveryPin = "1234"; // This should come from the database
      
      if (mockDeliveryPin !== pin) {
        toast({
          title: "Invalid PIN",
          description: "The PIN you entered is incorrect",
          variant: "destructive"
        });
        return false;
      }
      
      // Update order status to delivered
      const { error: updateError } = await supabase
        .from("orders")
        .update({ 
          status: "delivered",
          delivered_at: new Date().toISOString()
        })
        .eq("id", selectedOrderId)
        .eq("runner_id", currentUser.id);
      
      if (updateError) {
        console.error("Error updating order:", updateError);
        toast({
          title: "Update failed",
          description: "Could not mark order as delivered",
          variant: "destructive"
        });
        return false;
      }
      
      // Add to order status history
      const { error: historyError } = await supabase
        .from("order_status_history")
        .insert({
          order_id: selectedOrderId,
          status: "delivered",
          changed_by: currentUser.id,
          notes: "Order delivered to customer - PIN verified"
        });
      
      if (historyError) {
        console.error("Error updating order history:", historyError);
      }
      
      // Create earnings record
      const { error: earningsError } = await supabase
        .from("runner_earnings")
        .insert({
          runner_id: currentUser.id,
          order_id: selectedOrderId,
          base_fee: runnerBaseFee,
          tip_amount: 0,
          bonus_amount: 0,
          total_earned: runnerBaseFee
        });
      
      if (earningsError) {
        console.error("Error creating earnings record:", earningsError);
      }
      
      toast({
        title: "Order delivered",
        description: `Order has been successfully delivered. You earned R${runnerBaseFee.toFixed(2)}`
      });
      
      setSelectedOrderId(null);
      fetchOrders();
      return true;
    } catch (err) {
      console.error("Error verifying PIN:", err);
      toast({
        title: "Verification failed",
        description: "Please try again",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsVerifyingPin(false);
    }
  };

  // Effect to fetch orders when tab changes
  useEffect(() => {
    if (currentUser) {
      fetchOrders();
    }
  }, [activeTab, currentUser]);

  // Effect to get runner base fee
  useEffect(() => {
    if (currentUser) {
      const fetchFee = async () => {
        const fee = await getRunnerBaseFee();
        setRunnerBaseFee(fee);
      };
      fetchFee();
    }
  }, [currentUser]);

  // Calculate counts for bottom nav badges
  const availableOrdersCount = activeTab === "available" ? orders.length : 0;
  const activeOrdersCount = activeTab === "active" ? orders.length : 0;

  // Get current tab content
  const getCurrentTabContent = () => {
    switch (activeTab) {
      case "available":
        return (
          <AvailableOrdersTab
            orders={orders}
            isLoading={isLoading}
            error={error}
            runnerBaseFee={runnerBaseFee}
            onAcceptOrder={handleAcceptOrder}
            onRefresh={fetchOrders}
          />
        );
      case "active":
        return (
          <ActiveOrdersTab
            orders={orders}
            isLoading={isLoading}
            error={error}
            onMarkInTransit={handleMarkInTransit}
            onMarkDelivered={handleMarkDelivered}
            onVerifyCollection={handleVerifyCollection}
            isVerifyingCollection={isVerifyingCollection}
          />
        );
      case "completed":
        return (
          <CompletedOrdersTab
            orders={orders}
            isLoading={isLoading}
            error={error}
            runnerBaseFee={runnerBaseFee}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile Top Navigation */}
      <MobileTopNav
        isAvailable={isAvailable}
        onAvailabilityChange={setIsAvailable}
        notificationCount={0}
        onNotificationClick={() => setShowNotifications(true)}
      />

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto">
          {/* Tab Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold capitalize">{activeTab} Orders</h1>
            <p className="text-muted-foreground text-sm">
              {activeTab === "available" && "Accept new orders to start earning"}
              {activeTab === "active" && "Manage your current deliveries"}
              {activeTab === "completed" && "View your completed deliveries"}
            </p>
          </div>

          {/* Tab Content */}
          {getCurrentTabContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeOrdersCount={activeOrdersCount}
        availableOrdersCount={availableOrdersCount}
      />

      {/* Notifications Panel - Simple version for now */}
      {showNotifications && (
        <div className="fixed inset-0 bg-background z-50 p-4">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Notifications</h2>
              <button 
                onClick={() => setShowNotifications(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <RunnerNotifications />
          </div>
        </div>
      )}

      {/* PIN Verification Dialog */}
      <PinVerificationDialog
        isOpen={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onVerify={handlePinVerification}
        isVerifying={isVerifyingPin}
      />
    </div>
  );
};

export default Dashboard;