
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { notifyRunnersOfNewOrder } from "@/services/orderNotifications"

// Define Order type inline
interface Order {
  id: string
  order_number: string
  customer_id: string
  total_amount: number
  status: string
  created_at: string
}

const Dashboard = () => {
  const [user, setUser] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { toast } = useToast()

  const {
    data: orders,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }
      return data as Order[]
    }
  })

  // All hooks must be called before any early returns
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchUser()
  }, [])

  // Fixed useEffect - removed isRefreshing from dependencies to prevent infinite re-renders
  useEffect(() => {
    if (!user) return

    console.log('Setting up real-time subscription for orders...')
    
    const ordersChannel = supabase
      .channel('orders_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        async (payload) => {
          console.log('New order created:', payload.new)
          
          // Send SMS notifications to runners for new orders
          if (payload.new?.id) {
            await notifyRunnersOfNewOrder(payload.new.id)
          }
          
          // Use a ref to track refreshing state instead of state dependency
          setTimeout(() => {
            refetch()
          }, 1000)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated:', payload.new)
          
          // Refetch orders after update
          setTimeout(() => {
            refetch()
          }, 1000)
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up orders subscription...')
      supabase.removeChannel(ordersChannel)
    }
  }, [user, refetch]) // Removed isRefreshing from dependencies

  // Early returns only after all hooks have been called
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading orders...</div>
    </div>
  }

  if (isError) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg text-red-600">Error fetching orders: {error.message}</div>
    </div>
  }

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders?.filter((order) => order.status === selectedStatus)

  // Calculate metrics
  const activeOrders = orders?.filter(order => 
    ['pending', 'processing', 'out_for_delivery'].includes(order.status)
  ).length || 0

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  
  const todaysOrders = orders?.filter(order => 
    new Date(order.created_at) >= todayStart
  ) || []
  
  const todaysEarnings = todaysOrders.reduce((sum, order) => 
    sum + order.total_amount, 0
  )
  
  const totalEarnings = orders?.reduce((sum, order) => 
    sum + order.total_amount, 0
  ) || 0

  const handleStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return

    setIsRefreshing(true)
    const { data, error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', selectedOrder.id)
      .select()

    if (error) {
      toast({
        title: "Error updating order status",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Order status updated",
        description: `Order ${selectedOrder.order_number} status updated to ${newStatus}.`,
      })
      refetch()
    }

    setIsDialogOpen(false)
    setIsRefreshing(false)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline'
      case 'processing':
        return 'secondary'
      case 'out_for_delivery':
        return 'default'
      case 'delivered':
        return 'default'
      case 'cancelled':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        {isRefreshing && <Badge variant="outline" className="animate-pulse">Refreshing...</Badge>}
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <div className="h-4 w-4 rounded-full bg-blue-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              Currently being processed
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {todaysEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {todaysOrders.length} orders today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <div className="h-4 w-4 rounded-full bg-purple-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R {totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {orders?.length || 0} total orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            Manage and track all your orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center space-x-2">
            <Label htmlFor="status-filter">Filter by Status:</Label>
            <Select onValueChange={setSelectedStatus} defaultValue="all">
              <SelectTrigger id="status-filter" className="w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.customer_id}</TableCell>
                    <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</TableCell>
                    <TableCell className="font-medium">R {order.total_amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">Update Status</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Update Order Status</DialogTitle>
                            <DialogDescription>
                              Update the status of order #{order.order_number}.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="status">Status</Label>
                              <Select onValueChange={setNewStatus} defaultValue={order.status}>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="processing">Processing</SelectItem>
                                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                                  <SelectItem value="delivered">Delivered</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <Button onClick={() => {
                            setSelectedOrder(order)
                            handleStatusUpdate()
                          }}>Update Status</Button>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Showing {filteredOrders?.length || 0} of {orders?.length || 0} orders
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
