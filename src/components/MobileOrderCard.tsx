import { ChevronRight, MapPin, Package, Clock, DollarSign, Navigation, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  merchant?: {
    name: string;
    location: string;
  } | null;
  customer_addresses?: {
    building_name: string;
    room_number: string;
  } | null;
  created_at: string;
}

interface MobileOrderCardProps {
  order: Order;
  onAccept?: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
  showActionButton?: boolean;
  actionButtonText?: string;
  statusColor?: string;
}

export const MobileOrderCard = ({ 
  order, 
  onAccept, 
  onViewDetails, 
  showActionButton = false,
  actionButtonText = "Accept",
  statusColor = "bg-purple-100 text-purple-800"
}: MobileOrderCardProps) => {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ready": return "Awaiting Pickup";
      case "picked_up": return "Collected";
      case "in_transit": return "In Transit";
      case "delivered": return "Delivered";
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return Clock;
      case "picked_up": return Package;
      case "in_transit": return Navigation;
      case "delivered": return CheckCircle2;
      default: return Package;
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="bg-white mx-4 my-3 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="p-5">
        {/* Header with Order Number and Status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <span className="font-mono text-sm font-semibold text-gray-700">#{order.order_number}</span>
          </div>
          <Badge 
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-xs font-medium",
              order.status === "ready" && "bg-amber-100 text-amber-800",
              order.status === "picked_up" && "bg-blue-100 text-blue-800",
              order.status === "in_transit" && "bg-purple-100 text-purple-800",
              order.status === "delivered" && "bg-green-100 text-green-800"
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {getStatusDisplay(order.status)}
          </Badge>
        </div>
        
        {/* Amount Display */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <div className="text-sm font-medium text-green-600">R</div>
            <span className="text-2xl font-bold text-gray-900">
              {order.total_amount.toFixed(2)}
            </span>
          </div>
        </div>
        
        {/* Location Information */}
        <div className="space-y-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-orange-100 rounded-lg mt-0.5">
              <User className="h-3 w-3 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">From</p>
              <p className="font-semibold text-gray-900 truncate">
                {order.merchant?.name || "Unknown Merchant"}
              </p>
              {order.merchant?.location && (
                <p className="text-sm text-gray-600 truncate">{order.merchant.location}</p>
              )}
            </div>
          </div>
          
          {order.customer_addresses && (
            <div className="flex items-start gap-3">
              <div className="p-1.5 bg-blue-100 rounded-lg mt-0.5">
                <MapPin className="h-3 w-3 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">To</p>
                <p className="font-semibold text-gray-900">
                  {order.customer_addresses.building_name}
                </p>
                <p className="text-sm text-gray-600">
                  Room {order.customer_addresses.room_number}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Time Information */}
        <div className="flex items-center gap-2 mb-4 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>Ordered {format(new Date(order.created_at), "MMM d, h:mm a")}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          {showActionButton && onAccept ? (
            <Button 
              onClick={() => onAccept(order.id)}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white px-6 py-2.5 text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {actionButtonText}
            </Button>
          ) : (
            <div />
          )}
          
          <Button
            variant="ghost"
            onClick={() => onViewDetails(order.id)}
            className="text-gray-500 hover:text-primary hover:bg-primary/5 p-3 rounded-xl transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Import CheckCircle2 at the top with other imports