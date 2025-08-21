import {
  ChevronRight,
  MapPin,
  Package,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Zap,
  TrendingUp,
  Star,
  DollarSign,
  Timer,
  Sparkles,
} from "lucide-react";
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
  statusColor = "bg-purple-100 text-purple-800",
}: MobileOrderCardProps) => {
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "ready":
        return "Ready for Pickup";
      case "picked_up":
        return "Collected";
      case "in_transit":
        return "In Transit";
      case "delivered":
        return "Delivered";
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return Zap;
      case "picked_up":
        return Package;
      case "in_transit":
        return TrendingUp;
      case "delivered":
        return CheckCircle2;
      default:
        return Package;
    }
  };

  const getStatusGradient = (status: string) => {
    switch (status) {
      case "ready":
        return "from-orange-500 to-amber-500";
      case "picked_up":
        return "from-blue-500 to-indigo-500";
      case "in_transit":
        return "from-purple-500 to-violet-500";
      case "delivered":
        return "from-green-500 to-emerald-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "picked_up":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "in_transit":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "delivered":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="food-order-card animate-fade-in-up">
      {/* Animated Top Border */}
      <div className="h-0.5 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 bg-[length:200%_100%] animate-shimmer" />

      <div className="p-3">
        {/* Header with Enhanced Visual Hierarchy */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Status Icon with Glow Effect */}
            <div
              className={cn(
                "p-2 rounded-lg bg-gradient-to-br shadow-md",
                getStatusGradient(order.status)
              )}
            >
              <StatusIcon className="h-4 w-4 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-gray-900">
                  #{order.order_number}
                </span>
                <div
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-semibold border",
                    getStatusColor(order.status)
                  )}
                >
                  {getStatusDisplay(order.status)}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>
                  {format(new Date(order.created_at), "MMM d, h:mm a")}
                </span>
              </div>
            </div>
          </div>

          {/* Priority Badge */}
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-2 py-0.5 text-xs font-semibold border-0 shadow-md">
            <Sparkles className="h-3 w-3 mr-1" />
          </Badge>
        </div>

        {/* Amount Section - More Prominent */}
        <div className="mb-3 p-2 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                R{order.total_amount.toFixed(2)}
              </div>
              <div className="text-xs text-gray-600">Order Total</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-green-600">R10.00</div>
              <div className="text-xs text-gray-500">You'll Earn</div>
            </div>
          </div>
        </div>

        {/* Enhanced Location Cards */}
        <div className="space-y-2 mb-3">
          {/* Pickup Location */}
          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-blue-100 rounded-lg">
                <Package className="h-3 w-3 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold text-blue-700 mb-0.5">
                  From: {order.merchant?.name || "Unknown"}
                </div>
                <div className="text-xs text-gray-600">
                  {order.merchant?.location || "Location not specified"}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-blue-600">
                <Star className="h-3 w-3 fill-current" />
                <span>4.8</span>
              </div>
            </div>
          </div>

          {/* Delivery Location */}
          {order.customer_addresses && (
            <div className="p-2 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-purple-100 rounded-lg">
                  <MapPin className="h-3 w-3 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-purple-700 mb-0.5">
                    To: {order.customer_addresses.building_name}
                  </div>
                  <div className="text-xs text-gray-600">
                    Room {order.customer_addresses.room_number}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <Timer className="h-3 w-3" />
                  <span>15min</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          {showActionButton && onAccept ? (
            <Button
              onClick={() => onAccept(order.id)}
              className="flex-1 h-8 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
            >
              <Zap className="h-3 w-3 mr-1" />
              {actionButtonText}
            </Button>
          ) : (
            <div className="flex-1" />
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(order.id)}
            className="h-8 px-3 border border-orange-200 text-orange-600 hover:bg-orange-50 font-semibold rounded-lg transition-all duration-300"
          >
            Details
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>

        {/* Quick Stats Row */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              <span>2 items</span>
            </div>
            <div className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              <span>15min</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>1.2km</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-green-600 font-semibold">
            <CheckCircle2 className="h-3 w-3" />
            <span>Paid</span>
          </div>
        </div>
      </div>
    </div>
  );
};
