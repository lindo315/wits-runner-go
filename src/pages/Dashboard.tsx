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
  // ... keep existing code (state variables and hooks)
  const [user, setUser] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('')
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

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    fetchUser()
  }, [])

  if (isLoading) {
    return <div>Loading orders...</div>
  }

  if (isError) {
    return <div>Error fetching orders: {error.message}</div>
  }

  const filteredOrders = selectedStatus
    ? orders?.filter((order) => order.status === selectedStatus)
    : orders

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
          
          // Delay refetch to prevent race conditions
          setTimeout(() => {
            setIsRefreshing(true)
            setTimeout(() => {
              refetch()
              setIsRefreshing(false)
            }, 500)
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
          
          // Only refetch if we're not in the middle of a status update
          if (!isRefreshing) {
            setTimeout(() => {
              setIsRefreshing(true)
              setTimeout(() => {
                refetch()
                setIsRefreshing(false)
              }, 500)
            }, 1000)
          }
        }
      )
      .subscribe()

    return () => {
      console.log('Cleaning up orders subscription...')
      supabase.removeChannel(ordersChannel)
    }
  }, [user, refetch, isRefreshing])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>

      <div className="mb-4 flex items-center space-x-2">
        <Label htmlFor="status-filter">Filter by Status:</Label>
        <Select onValueChange={setSelectedStatus}>
          <SelectTrigger id="status-filter">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        {isRefreshing && <Badge variant="outline">Refreshing...</Badge>}
      </div>

      <Table>
        <TableCaption>A list of your recent orders.</TableCaption>
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
              <TableCell>R {order.total_amount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant="secondary">{order.status}</Badge>
              </TableCell>
              <TableCell className="text-right">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Update Status</Button>
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
            <TableCell colSpan={6}>
              {orders?.length} order(s)
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

export default Dashboard
