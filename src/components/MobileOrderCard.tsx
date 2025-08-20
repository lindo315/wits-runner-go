import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  CreditCard, 
  CheckCircle2,
  ArrowRightCircle,
  AlertCircle
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

interface MobileOrderCardProps {
  order: Order;
  type: "available" | "active" | "completed";
  onAccept?: (orderId: string) => void;
  onMarkInTransit?: (orderId: string) => void;
  onStartDelivery?: (orderId: string) => void;
  isAvailable?: boolean;
  isUpdating?: boolean;
  runnerBaseFee?: number;
}

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

export function MobileOrderCard({ 
  order, 
  type, 
  onAccept,
  onMarkInTransit,
  onStartDelivery,
  isAvailable = true,
  isUpdating = false,
  runnerBaseFee = 10.00
}: MobileOrderCardProps) {
  const formatOrderDate = (dateString: string) => {
    return format(new Date(dateString), "MMM d, h:mm a");
  };

  const renderActionButton = () => {
    if (type === "available" && onAccept) {
      return (
        <Button 
          onClick={() => onAccept(order.id)}
          disabled={!isAvailable || isUpdating}
          size="sm"
          className="w-full"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Accept Order
        </Button>
      );
    }

    if (type === "active") {
      if (order.status === "ready" && order.collection_pin) {
        return (
          <div className="space-y-2">
            <div className="text-center p-2 bg-primary/10 rounded-md">
              <p className="text-sm font-medium">Collection PIN</p>
              <p className="text-lg font-bold text-primary">{order.collection_pin}</p>
            </div>
            {onMarkInTransit && (
              <Button 
                onClick={() => onMarkInTransit(order.id)}
                disabled={isUpdating}
                size="sm"
                className="w-full"
              >
                <ArrowRightCircle className="h-4 w-4 mr-2" />
                Mark In Transit
              </Button>
            )}
          </div>
        );
      }

      if (order.status === "in_transit" && order.delivery_pin && onStartDelivery) {
        return (
          <Button 
            onClick={() => onStartDelivery(order.id)}
            disabled={isUpdating}
            size="sm"
            className="w-full"
          >
            Complete Delivery
          </Button>
        );
      }
    }

    return null;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Order Header */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-base">
                Order #{order.order_number}
              </h3>
              <p className="text-sm text-muted-foreground">
                {formatOrderDate(order.created_at)}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge className={statusColors[order.status]} variant="secondary">
                {statusLabels[order.status]}
              </Badge>
              <Badge className={paymentStatusColors[order.payment_status]} variant="outline">
                {order.payment_status}
              </Badge>
            </div>
          </div>

          {/* Merchant Info */}
          {order.merchant && (
            <div className="flex items-start space-x-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">{order.merchant.name}</p>
                <p className="text-muted-foreground">{order.merchant.location}</p>
              </div>
            </div>
          )}

          {/* Delivery Address */}
          {order.customer_addresses && (
            <div className="text-sm">
              <p className="font-medium mb-1">Delivery to:</p>
              <p className="text-muted-foreground">
                {order.customer_addresses.building_name}
                {order.customer_addresses.room_number && ` - Room ${order.customer_addresses.room_number}`}
              </p>
              {order.customer_addresses.delivery_instructions && (
                <p className="text-muted-foreground italic text-xs mt-1">
                  "{order.customer_addresses.delivery_instructions}"
                </p>
              )}
            </div>
          )}

          {/* Order Items - Show first 2 items */}
          {order.order_items && order.order_items.length > 0 && (
            <div className="text-sm">
              <p className="font-medium mb-1">Items:</p>
              <div className="space-y-1">
                {order.order_items.slice(0, 2).map((item) => (
                  <p key={item.id} className="text-muted-foreground text-xs">
                    {item.quantity}x {item.menu_item?.name || "Item"}
                  </p>
                ))}
                {order.order_items.length > 2 && (
                  <p className="text-muted-foreground text-xs">
                    +{order.order_items.length - 2} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Amount */}
          <Separator />
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold text-lg">
                R{order.total_amount?.toFixed(2) || "0.00"}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              Earn: R{runnerBaseFee.toFixed(2)}
            </span>
          </div>

          {/* Action Button */}
          {renderActionButton()}
        </div>
      </CardContent>
    </Card>
  );
}