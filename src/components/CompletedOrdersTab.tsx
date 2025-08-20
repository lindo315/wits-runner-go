import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  User
} from "lucide-react";
import { format } from "date-fns";
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

interface CompletedOrdersTabProps {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  runnerBaseFee: number;
}

export const CompletedOrdersTab = ({
  orders,
  isLoading,
  error,
  runnerBaseFee
}: CompletedOrdersTabProps) => {
  const navigate = useNavigate();

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
                <div className="h-16 bg-muted/30 rounded"></div>
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
        <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-medium mb-2">No completed orders yet</p>
        <p className="text-sm text-muted-foreground px-4">
          Orders you've delivered will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      {orders.map(order => (
        <Card key={order.id} className="border-l-4 border-l-green-500 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Header */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-lg">Order #{order.order_number}</h3>
                  <Badge className="bg-green-100 text-green-800">
                    Delivered
                  </Badge>
                  <Badge className={paymentStatusColors[order.payment_status] || "bg-muted"}>
                    {order.payment_status ? order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) : "Pending"}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Delivered: {order.delivered_at && formatOrderDate(order.delivered_at)}</span>
                </div>
              </div>

              {/* Summary Info */}
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                  <ShoppingBag className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span className="font-medium break-words">{order.merchant?.name}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-50 rounded">
                  <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <span className="font-medium break-words">{order.customer_addresses?.building_name}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CreditCard className="w-4 h-4 text-green-500 flex-shrink-0" />
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

              {/* Action Section */}
              <div className="flex flex-col gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-600">R{order.total_amount?.toFixed(2)}</p>
                  <p className="text-sm text-green-600 font-medium">
                    Earned: R{runnerBaseFee.toFixed(2)}
                  </p>
                </div>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};