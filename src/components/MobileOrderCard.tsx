import { ChevronRight, MapPin, Package, Clock, User, CheckCircle2, AlertCircle } from "lucide-react";
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
      case "ready": return AlertCircle;
      case "picked_up": return Package;
      case "in_transit": return Package;
      case "delivered": return CheckCircle2;
      default: return Package;
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="bg-white mx-4 mb-3 rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="font-mono text-sm text-gray-600">#{order.order_number}</span>
          </div>
          <Badge 
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs",
              order.status === "ready" && "bg-orange-100 text-orange-700 border-orange-200",
              order.status === "picked_up" && "bg-blue-100 text-blue-700 border-blue-200",
              order.status === "in_transit" && "bg-purple-100 text-purple-700 border-purple-200",
              order.status === "delivered" && "bg-green-100 text-green-700 border-green-200"
            )}
          >
            <StatusIcon className="h-3 w-3" />
            {getStatusDisplay(order.status)}
          </Badge>
        </div>
        
        {/* Amount */}
        <div className="mb-3">
          <div className="text-xl font-bold text-gray-900">
            R{order.total_amount.toFixed(2)}
          </div>
        </div>
        
        {/* Location Info */}
        <div className="space-y-2 mb-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="h-3 w-3" />
            <span className="font-medium">{order.merchant?.name || "Unknown Merchant"}</span>
          </div>
          {order.customer_addresses && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="h-3 w-3" />
              <span>{order.customer_addresses.building_name} - Room {order.customer_addresses.room_number}</span>
            </div>
          )}
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 mb-4 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{format(new Date(order.created_at), "MMM d, h:mm a")}</span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between">
          {showActionButton && onAccept ? (
            <Button 
              onClick={() => onAccept(order.id)}
              className="bg-primary hover:bg-primary/90 text-white px-4 py-2 text-sm rounded-md"
            >
              {actionButtonText}
            </Button>
          ) : (
            <div />
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(order.id)}
            className="text-gray-500 hover:text-gray-700"
          >
            View Details
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// Import CheckCircle2 at the top with other imports