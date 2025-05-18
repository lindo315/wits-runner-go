
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingBag, Phone, User } from "lucide-react";

import {
  generateMockOrders,
  generateEarningsData,
  calculateEarningsSummary,
  formatOrderDate,
  Order
} from "@/services/mockData";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [activeTab, setActiveTab] = useState("available");
  const [orders, setOrders] = useState<Order[]>([]);
  const [earnings, setEarnings] = useState({
    today: { count: 0, amount: 0 },
    weekly: { count: 0, amount: 0 },
    monthly: { count: 0, amount: 0 },
    total: { count: 0, amount: 0 }
  });
  
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
  
  // Fetch orders based on active tab
  const fetchOrders = () => {
    const allOrders = generateMockOrders();
    let filteredOrders: Order[] = [];
    
    switch (activeTab) {
      case "available":
        filteredOrders = allOrders.filter(
          order => order.status === "ready" && !order.runner_id
        );
        break;
      case "active":
        filteredOrders = allOrders.filter(
          order => 
            (order.status === "picked_up" || order.status === "in_transit") &&
            order.runner_id === currentUser?.id
        );
        break;
      case "completed":
        filteredOrders = allOrders.filter(
          order => 
            order.status === "delivered" && 
            order.runner_id === currentUser?.id
        );
        break;
      default:
        filteredOrders = [];
    }
    
    setOrders(filteredOrders);
  };
  
  // Fetch earnings data
  const fetchEarnings = () => {
    if (currentUser) {
      const earningsData = generateEarningsData(currentUser.id);
      const summary = calculateEarningsSummary(earningsData);
      setEarnings(summary);
    }
  };
  
  // Handle order acceptance
  const handleAcceptOrder = (orderId: string) => {
    if (!isAvailable) {
      toast({
        title: "You are currently unavailable",
        description: "Please set your status to available to accept orders",
        variant: "destructive"
      });
      return;
    }
    
    // Update order status (in a real app, this would be a database update)
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    
    toast({
      title: "Order accepted",
      description: "You have successfully accepted this order"
    });
    
    // Switch to active tab
    setActiveTab("active");
  };
  
  // Order status update handlers
  const handleMarkPickedUp = (orderId: string) => {
    toast({
      title: "Order updated",
      description: "Order marked as picked up"
    });
    fetchOrders();
  };
  
  const handleMarkInTransit = (orderId: string) => {
    toast({
      title: "Order updated",
      description: "Order marked as in transit"
    });
    fetchOrders();
  };
  
  const handleMarkDelivered = (orderId: string) => {
    toast({
      title: "Order delivered",
      description: "Order has been successfully delivered"
    });
    fetchOrders();
    fetchEarnings();
  };
  
  // Handle runner availability toggle
  const handleStatusChange = (checked: boolean) => {
    setIsAvailable(checked);
    toast({
      title: checked ? "You are now available" : "You are now unavailable",
      description: checked 
        ? "You can now accept new deliveries" 
        : "You won't receive new delivery requests"
    });
  };
  
  // Effect to fetch data when tab changes
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  // Effect to fetch earnings data on mount
  useEffect(() => {
    fetchEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container py-6 animate-fade-in">
        {/* Header & Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Runner Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your deliveries, track orders and earnings
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-3">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="runner-status" 
                  checked={isAvailable} 
                  onCheckedChange={handleStatusChange}
                />
                <Label htmlFor="runner-status">
                  {isAvailable ? "Available" : "Unavailable"}
                </Label>
              </div>
              
              <Button variant="outline" onClick={() => navigate("/profile")}>
                Profile Settings
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Active Orders</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(order => 
                      order.status === "picked_up" || order.status === "in_transit"
                    ).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Today's Earnings</p>
                  <p className="text-2xl font-bold">R{earnings.today.amount.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-primary/5">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total Earnings</p>
                  <p className="text-2xl font-bold">R{earnings.total.amount.toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:w-[400px] mb-6">
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          {/* Available Orders Tab */}
          <TabsContent value="available">
            <h2 className="text-xl font-semibold mb-4">Available Orders</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-muted-foreground">No available orders at the moment</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Check back soon for new delivery opportunities
                </p>
              </div>
            ) : (
              <div>
                {orders.map(order => (
                  <Card key={order.id} className="mb-4">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            <Badge className={statusColors.ready}>
                              {statusLabels.ready}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {formatOrderDate(order.created_at)}
                          </p>
                          <div className="space-y-1 mb-4">
                            <div className="flex items-start gap-2">
                              <ShoppingBag className="w-4 h-4 mt-1" />
                              <div>
                                <p className="font-medium">{order.merchant?.name}</p>
                                <p className="text-sm text-muted-foreground">{order.merchant?.location}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-1" />
                              <div>
                                <p className="font-medium">Delivery to:</p>
                                <p className="text-sm">{order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}</p>
                              </div>
                            </div>
                          </div>
                          {order.order_items && (
                            <div>
                              <p className="text-sm font-medium mb-1">Order items:</p>
                              <ul className="text-sm list-disc pl-5">
                                {order.order_items.map((item, index) => (
                                  <li key={index}>{item.quantity}x {item.menu_item?.name}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col items-end">
                          <p className="font-medium text-lg mb-4">R{order.total_amount?.toFixed(2)}</p>
                          <Button onClick={() => handleAcceptOrder(order.id)}>
                            Accept Order
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Active Orders Tab */}
          <TabsContent value="active">
            <h2 className="text-xl font-semibold mb-4">Active Orders</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-muted-foreground">No active orders</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Orders you accept will appear here
                </p>
              </div>
            ) : (
              <div>
                {orders.map(order => (
                  <Card key={order.id} className="mb-4">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            <Badge className={statusColors[order.status]}>
                              {statusLabels[order.status]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {formatOrderDate(order.created_at)}
                          </p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2">
                              <ShoppingBag className="w-4 h-4 mt-1" />
                              <div>
                                <p className="font-medium">{order.merchant?.name}</p>
                                <p className="text-sm text-muted-foreground">{order.merchant?.location}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-1" />
                              <div>
                                <p className="font-medium">Delivery to:</p>
                                <p className="text-sm">{order.customer_addresses?.building_name}, Room {order.customer_addresses?.room_number}</p>
                                {order.customer_addresses?.delivery_instructions && (
                                  <p className="text-sm text-muted-foreground">
                                    Note: {order.customer_addresses.delivery_instructions}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col items-end">
                          <p className="font-medium text-lg mb-4">R{order.total_amount?.toFixed(2)}</p>
                          
                          {order.status === "picked_up" && (
                            <Button onClick={() => handleMarkInTransit(order.id)}>
                              Mark In Transit
                            </Button>
                          )}
                          
                          {order.status === "in_transit" && (
                            <Button onClick={() => handleMarkDelivered(order.id)}>
                              Mark Delivered
                            </Button>
                          )}
                          
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => navigate(`/order-details/${order.id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Completed Orders Tab */}
          <TabsContent value="completed">
            <h2 className="text-xl font-semibold mb-4">Completed Orders</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border">
                <p className="text-muted-foreground">No completed orders yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Orders you've delivered will appear here
                </p>
              </div>
            ) : (
              <div>
                {orders.map(order => (
                  <Card key={order.id} className="mb-4">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">Order #{order.order_number}</h3>
                            <Badge className={statusColors.delivered}>
                              {statusLabels.delivered}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Delivered: {order.delivered_at && formatOrderDate(order.delivered_at)}
                          </p>
                          <div className="space-y-1 mt-3">
                            <div className="flex items-start gap-2">
                              <ShoppingBag className="w-4 h-4 mt-1" />
                              <p className="font-medium">{order.merchant?.name}</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 mt-1" />
                              <p className="font-medium">{order.customer_addresses?.building_name}</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col items-end">
                          <p className="font-medium text-lg mb-4">R{order.total_amount?.toFixed(2)}</p>
                          <p className="text-sm text-green-600 font-medium">
                            Earned: R15.00
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
