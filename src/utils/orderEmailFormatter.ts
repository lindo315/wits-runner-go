
import { OrderEmailData } from '@/services/emailNotificationService';

// Utility function to format order data for email notifications
export const formatOrderForEmail = (orderData: any): OrderEmailData => {
  return {
    orderId: orderData.id,
    orderNumber: orderData.order_number,
    customerName: orderData.customer_name || 'Unknown Customer',
    customerPhone: orderData.customer_phone || '',
    customerEmail: orderData.customer_email,
    deliveryAddress: formatDeliveryAddress(orderData),
    items: formatOrderItems(orderData.order_items || []),
    subtotal: parseFloat(orderData.subtotal || '0'),
    deliveryFee: parseFloat(orderData.delivery_fee || '0'),
    totalAmount: parseFloat(orderData.total_amount || '0'),
    orderTimestamp: orderData.created_at,
    priority: determinePriority(orderData),
    specialInstructions: orderData.special_instructions,
  };
};

const formatDeliveryAddress = (orderData: any): string => {
  const address = orderData.delivery_address;
  if (!address) return 'Address not provided';
  
  if (typeof address === 'string') return address;
  
  // If address is an object, construct full address
  const parts = [
    address.street_address,
    address.building_name,
    address.room_number,
    address.city,
    address.postal_code
  ].filter(Boolean);
  
  let formattedAddress = parts.join(', ');
  
  if (address.delivery_instructions) {
    formattedAddress += `\n\nDelivery Instructions: ${address.delivery_instructions}`;
  }
  
  return formattedAddress;
};

const formatOrderItems = (items: any[]): OrderEmailData['items'] => {
  return items.map(item => ({
    name: item.menu_item?.name || item.name || 'Unknown Item',
    quantity: parseInt(item.quantity || '1'),
    price: parseFloat(item.item_price || '0'),
    total: parseFloat(item.total_price || '0'),
  }));
};

const determinePriority = (orderData: any): 'normal' | 'high' | 'urgent' => {
  // Determine priority based on order value, time, or explicit priority
  const totalAmount = parseFloat(orderData.total_amount || '0');
  const orderTime = new Date(orderData.created_at);
  const currentTime = new Date();
  const timeDiff = currentTime.getTime() - orderTime.getTime();
  
  // Mark as urgent if explicitly set
  if (orderData.priority_level === 'urgent' || orderData.priority_level > 5) {
    return 'urgent';
  }
  
  // Mark as high priority for large orders
  if (totalAmount > 500) {
    return 'high';
  }
  
  // Mark as urgent if order is very recent (within 5 minutes) and high value
  if (timeDiff < 5 * 60 * 1000 && totalAmount > 200) {
    return 'urgent';
  }
  
  return 'normal';
};
