import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  Clock, 
  AlertCircle, 
  RefreshCcw,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";

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

interface AvailableOrdersTabProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  runnerBaseFee: number;
  onAcceptOrder: (orderId: string) => void;
  onRefresh: () => void;
}

export const AvailableOrdersTab = ({
  orders,
  isLoading,
  error,
  runnerBaseFee,
  onAcceptOrder,
  onRefresh
}: AvailableOrdersTabProps) => {
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
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                <div className="h-20 bg-muted/30 rounded"></div>
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
        <p className="text-destructive font-medium mb-4">{error}</p>
        <Button onClick={onRefresh} variant="outline">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 pb-20">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-medium mb-2">No orders available</p>
        <p className="text-sm text-muted-foreground px-4">
          New orders will appear here when they're ready for pickup
        </p>
        <Button onClick={onRefresh} variant="outline" className="mt-4">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {orders.map(order => (
        <Card key={order.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                  <Badge className={statusColors[order.status]}>
                    Ready
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
                <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <ShoppingBag className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">Pickup from:</p>
                    <p className="font-semibold break-words">{order.merchant?.name}</p>
                    <p className="text-sm text-muted-foreground break-words">{order.merchant?.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-secondary/50 rounded-lg">
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
                  <p className="font-medium text-sm">Payment:</p>
                  <p className="text-sm">{order.payment_method === "cash" ? "Cash on Delivery" : "Online Payment"}</p>
                  {order.payment_method === "cash" && (
                    <div className="mt-2 p-2 bg-yellow-100 border border-yellow-200 rounded text-xs text-yellow-800">
                      <strong>Collect: R{order.total_amount?.toFixed(2)} in cash</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items Preview */}
              {order.order_items && order.order_items.length > 0 && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="font-medium text-sm mb-2">Items ({order.order_items.length}):</p>
                  <div className="space-y-1">
                    {order.order_items.slice(0, 2).map((item, index) => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.quantity}x {item.menu_item?.name || 'Unknown Item'}</span>
                      </div>
                    ))}
                    {order.order_items.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{order.order_items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Section */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t">
                <div className="text-center sm:text-left">
                  <p className="text-2xl font-bold text-primary mb-1">R{order.total_amount?.toFixed(2)}</p>
                  <p className="text-muted-foreground text-sm">Total amount</p>
                  <div className="mt-2 p-2 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-primary" />
                      <p className="text-primary font-semibold text-sm">You'll earn: R{runnerBaseFee.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={() => onAcceptOrder(order.id)}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto"
                >
                  Accept Order
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};