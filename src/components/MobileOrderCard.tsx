import { ChevronRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      case "picked_up": return "In Transit";
      case "in_transit": return "In Transit";
      case "delivered": return "Delivered";
      default: return status;
    }
  };

  return (
    <div className="bg-white mx-4 my-2 rounded-lg border shadow-sm">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-gray-600" />
            <span className="font-mono text-sm text-gray-600">#{order.order_number}</span>
          </div>
          <Badge className={cn("text-xs", statusColor)}>
            {getStatusDisplay(order.status)}
          </Badge>
        </div>
        
        <div className="mb-3">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${order.total_amount.toFixed(2)}
          </div>
        </div>
        
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>From:</span>
            <span className="font-medium text-right flex-1 ml-2">
              {order.merchant?.name || "Unknown Merchant"}
            </span>
          </div>
          {order.customer_addresses && (
            <div className="flex justify-between">
              <span>To:</span>
              <span className="font-medium text-right flex-1 ml-2">
                {order.customer_addresses.building_name} - {order.customer_addresses.room_number}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          {showActionButton && onAccept ? (
            <Button 
              onClick={() => onAccept(order.id)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 text-sm"
            >
              {actionButtonText}
            </Button>
          ) : (
            <div />
          )}
          
          <Button
            variant="ghost"
            onClick={() => onViewDetails(order.id)}
            className="text-gray-600 hover:text-gray-900 p-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Package = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
  </svg>
);