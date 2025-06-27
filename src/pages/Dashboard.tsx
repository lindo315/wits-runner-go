
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Clock, MapPin, DollarSign, Package, LogOut, User, TrendingUp } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("available");

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        customer_addresses!delivery_address_id (
          full_address
        ),
        order_items (
          id,
          quantity,
          menu_items (
            name
          )
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }

    return data;
  };

  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const handleSignOut = async () => {
    try {
      await logout();
      toast({ title: "Signed out successfully" });
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
      toast({ 
        title: "Error signing out", 
        description: "Please try again",
        variant: "destructive" 
      });
    }
  };

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ runner_id: currentUser?.id, status: 'accepted' })
        .eq("id", orderId)
        .select();
  
      if (error) {
        console.error("Error accepting order:", error);
        toast({
          title: "Failed to accept order",
          description: "Please try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Order accepted",
          description: "You have accepted the order.",
        });
      }
    } catch (error) {
      console.error("Error accepting order:", error);
      toast({
        title: "Failed to accept order",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-300";
      case "picked_up":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "delivered":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "pending":
        return "bg-purple-100 text-purple-800 border-purple-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">Nutrix Runner</h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate max-w-[200px]">
                {currentUser?.email}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link to="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              asChild
              className="hidden sm:flex"
            >
              <Link to="/earnings">
                <TrendingUp className="h-4 w-4 mr-2" />
                Earnings
              </Link>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="flex sm:hidden mt-3 space-x-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to="/profile">
              <User className="h-4 w-4 mr-1" />
              Profile
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link to="/earnings">
              <TrendingUp className="h-4 w-4 mr-1" />
              Earnings
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Status Card */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Welcome back, Runner!
                </h2>
                <p className="text-sm text-gray-600">
                  Ready to deliver some orders?
                </p>
              </div>
              <Badge variant="secondary" className="text-green-700 bg-green-100 w-fit">
                Active Runner
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Orders Section */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="available" className="text-xs sm:text-sm">
                  Available ({orders?.filter(o => ['ready', 'pending'].includes(o.status) && !o.runner_id).length || 0})
                </TabsTrigger>
                <TabsTrigger value="active" className="text-xs sm:text-sm">
                  Active ({orders?.filter(o => o.runner_id === currentUser?.id && ['accepted', 'picked_up'].includes(o.status)).length || 0})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-xs sm:text-sm">
                  Completed ({orders?.filter(o => o.runner_id === currentUser?.id && o.status === 'delivered').length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="available" className="space-y-4">
                {orders?.filter(order => ['ready', 'pending'].includes(order.status) && !order.runner_id).length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No available orders</h3>
                    <p className="text-gray-500 text-sm">Check back later for new delivery opportunities!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders
                      ?.filter(order => ['ready', 'pending'].includes(order.status) && !order.runner_id)
                      .map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-blue-500">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                                  <Badge variant="outline" className={getStatusColor(order.status)}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </Badge>
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    Order #{order.id.slice(-8)}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">{order.customer_addresses?.full_address || 'Address not available'}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>{format(new Date(order.created_at), 'MMM d, h:mm a')}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>R{order.delivery_fee}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>{order.order_items?.length || 0} items</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-col space-y-2 sm:ml-4">
                                <Button
                                  size="sm"
                                  onClick={() => handleAcceptOrder(order.id)}
                                  className="w-full sm:w-auto"
                                >
                                  Accept Order
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  asChild
                                  className="w-full sm:w-auto"
                                >
                                  <Link to={`/order-details/${order.id}`}>
                                    View Details
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-4">
                {orders?.filter(order => order.runner_id === currentUser?.id && ['accepted', 'picked_up'].includes(order.status)).length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Clock className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No active orders</h3>
                    <p className="text-gray-500 text-sm">Accept an available order to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders
                      ?.filter(order => order.runner_id === currentUser?.id && ['accepted', 'picked_up'].includes(order.status))
                      .map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-green-500">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                                  <Badge variant="outline" className={getStatusColor(order.status)}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                                  </Badge>
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    Order #{order.id.slice(-8)}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">{order.customer_addresses?.full_address || 'Address not available'}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>{format(new Date(order.created_at), 'MMM d, h:mm a')}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>R{order.delivery_fee}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>{order.order_items?.length || 0} items</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="w-full sm:w-auto"
                              >
                                <Link to={`/order-details/${order.id}`}>
                                  Manage Order
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {orders?.filter(order => order.runner_id === currentUser?.id && order.status === 'delivered').length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed orders</h3>
                    <p className="text-gray-500 text-sm">Your completed deliveries will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders
                      ?.filter(order => order.runner_id === currentUser?.id && order.status === 'delivered')
                      .map((order) => (
                        <Card key={order.id} className="border-l-4 border-l-gray-500">
                          <CardContent className="p-4">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                              <div className="flex-1 space-y-2">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
                                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                    Delivered
                                  </Badge>
                                  <span className="text-xs sm:text-sm text-gray-500">
                                    Order #{order.id.slice(-8)}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                  <div className="flex items-center text-gray-600">
                                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="truncate">{order.customer_addresses?.full_address || 'Address not available'}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>{format(new Date(order.created_at), 'MMM d, h:mm a')}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>R{order.delivery_fee}</span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span>{order.order_items?.length || 0} items</span>
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="w-full sm:w-auto"
                              >
                                <Link to={`/order-details/${order.id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
