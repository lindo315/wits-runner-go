
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface OrderFormProps {
  onCreateOrder?: (orderData: any) => Promise<string | null>;
  isCreatingOrder?: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({ 
  onCreateOrder, 
  isCreatingOrder = false 
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onCreateOrder) {
      toast({
        title: "Error",
        description: "Order creation handler not available",
        variant: "destructive",
      });
      return;
    }

    // Sample order data - you should replace this with your actual order data structure
    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      delivery_address: deliveryAddress,
      special_instructions: specialInstructions,
      subtotal: 25.00, // Replace with actual subtotal
      delivery_fee: 5.00, // Replace with actual delivery fee
      total_amount: 30.00, // Replace with actual total
      payment_method: 'card',
      order_items: [
        {
          menu_item_id: 'sample-item-id',
          quantity: 1,
          item_price: 25.00,
          total_price: 25.00,
        }
      ]
    };

    try {
      const orderId = await onCreateOrder(orderData);
      if (orderId) {
        // Reset form
        setCustomerName('');
        setCustomerPhone('');
        setCustomerEmail('');
        setDeliveryAddress('');
        setSpecialInstructions('');
        
        toast({
          title: "Order Placed Successfully!",
          description: "Your order has been placed and the delivery team has been notified.",
        });
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Place Your Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="customerPhone">Phone Number</Label>
            <Input
              id="customerPhone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="customerEmail">Email (Optional)</Label>
            <Input
              id="customerEmail"
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="deliveryAddress">Delivery Address</Label>
            <Textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special delivery instructions..."
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCreatingOrder}
          >
            {isCreatingOrder ? 'Placing Order...' : 'Place Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderForm;
