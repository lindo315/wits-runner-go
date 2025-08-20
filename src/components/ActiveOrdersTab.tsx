import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  User,
  ArrowRightCircle
} from "lucide-react";
import { format } from "date-fns";
import { CollectionPinDisplay } from "@/components/CollectionPinDisplay";
import { useNavigate } from "react-router-dom";

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

interface ActiveOrdersTabProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  onMarkInTransit: (orderId: string) => void;
  onMarkDelivered: (orderId: string) => void;
  onVerifyCollection: (orderId: string) => void;
  isVerifyingCollection: boolean;
}

export const ActiveOrdersTab = ({
  orders,
  isLoading,
  error,
  onMarkInTransit,
  onMarkDelivered,
  onVerifyCollection,
  isVerifyingCollection
}: ActiveOrdersTabProps) => {
  const navigate = useNavigate();

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

  const paymentStatusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-blue-100 text-blue-800"
  };

  const formatOrderDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                <div className="h-24 bg-muted/30 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 pb-20">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 pb-20">
        <ArrowRightCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-medium mb-2">No active orders</p>
        <p className="text-sm text-muted-foreground px-4">
          Orders you accept will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {orders.map(order => (
        <Card key={order.id} className="border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                  <Badge className={statusColors[order.status]}>
                    {statusLabels[order.status]}
                  </Badge>
                  <Badge className={paymentStatusColors[order.payment_status] || "bg-muted"}>
                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{formatOrderDate(order.created_at)}</span>
                </div>
              </div>

              {/* Location Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <ShoppingBag className="w-5 h-5 mt-0.5 text-blue-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Pickup from:</p>
                    <p className="font-semibold break-words">{order.merchant?.name}</p>
                    <p className="text-sm text-muted-foreground break-words">{order.merchant?.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <MapPin className="w-5 h-5 mt-0.5 text-purple-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Deliver to:</p>
                    <p className="font-semibold break-words">{order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}</p>
                    {order.customer_addresses?.delivery_instructions && (
                      <p className="text-sm text-muted-foreground mt-1 break-words">
                        Note: {order.customer_addresses.delivery_instructions}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CreditCard className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Payment Details:</p>
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

              {/* Collection PIN for ready orders */}
              {order.status === "ready" && order.collection_pin && (
                <div className="w-full">
                  <CollectionPinDisplay 
                    pin={order.collection_pin}
                    orderNumber={order.order_number}
                    merchantName={order.merchant?.name}
                    onVerify={() => onVerifyCollection(order.id)}
                    isVerifying={isVerifyingCollection}
                  />
                </div>
              )}

              {/* Action Section */}
              <div className="flex flex-col gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-600">R{order.total_amount?.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Total amount</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  {/* Mark In Transit button for picked up orders */}
                  {order.status === "picked_up" && (
                    <Button 
                      onClick={() => onMarkInTransit(order.id)}
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                    >
                      Mark In Transit
                    </Button>
                  )}
                  
                  {/* Mark Delivered button for in transit orders */}
                  {order.status === "in_transit" && (
                    <Button 
                      onClick={() => onMarkDelivered(order.id)}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white w-full"
                    >
                      Mark Delivered
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`/order-details/${order.id}`)}
                    className="flex items-center gap-2 justify-center"
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
  );
};