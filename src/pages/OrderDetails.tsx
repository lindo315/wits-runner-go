
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { generateMockOrders, formatOrderDate, Order, Customer } from "@/services/mockData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ShoppingBag, MapPin, User, Phone } from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Status styling
  const statusLabels = {
    ready: "Ready",
    picked_up: "Picked Up",
    in_transit: "In Transit",
    delivered: "Delivered"
  };
  
  const statusColors = {
    ready: "status-ready",
    picked_up: "status-picked-up",
    in_transit: "status-in-transit",
    delivered: "status-delivered"
  };
  
  // Fetch order data
  useEffect(() => {
    const fetchOrder = () => {
      setLoading(true);
      
      // Find order in mock data
      const allOrders = generateMockOrders();
      const foundOrder = allOrders.find(order => order.id === id);
      
      if (foundOrder) {
        setOrder(foundOrder);
        
        // Mock customer data
        setCustomer({
          id: foundOrder.customer_id,
          full_name: "Jane Student",
          phone_number: "0711234567"
        });
      }
      
      setLoading(false);
    };
    
    fetchOrder();
  }, [id]);
  
  if (loading) {
    return (
      <div className="container py-8">
        <p>Loading order details...</p>
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
  
  // Order action handlers
  const handleAcceptOrder = () => {
    toast({
      title: "Order accepted",
      description: "You are now assigned to this delivery"
    });
    navigate("/dashboard");
  };
  
  const handleMarkPickedUp = () => {
    toast({
      title: "Order updated",
      description: "Order marked as picked up"
    });
  };
  
  const handleMarkInTransit = () => {
    toast({
      title: "Order updated",
      description: "Order marked as in transit"
    });
  };
  
  const handleMarkDelivered = () => {
    toast({
      title: "Order delivered",
      description: "Order has been successfully delivered"
    });
    navigate("/dashboard");
  };
  
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
                <Badge className={statusColors[order.status]}>
                  {statusLabels[order.status]}
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
              
              {customer && (
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 mt-1 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-medium">{customer.full_name}</p>
                    {customer.phone_number && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(`tel:${customer.phone_number}`, '_blank')}
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
                {order.order_items && order.order_items.map((item, index) => (
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
                    <p className="font-medium">R{(item.total_price ?? 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>R{(order.subtotal ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>R{(order.delivery_fee ?? 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium pt-2">
                  <span>Total</span>
                  <span>R{(order.total_amount ?? 0).toFixed(2)}</span>
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
                  Remember to collect R{(order.total_amount ?? 0).toFixed(2)} in cash from the customer.
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
