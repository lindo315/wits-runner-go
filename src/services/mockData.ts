
import { format, subDays, subMinutes } from "date-fns";

// Types
export interface Merchant {
  id: string;
  name: string;
  location: string;
  contact_phone?: string;
}

export interface CustomerAddress {
  id: string;
  building_name: string;
  room_number: string;
  full_address?: string;
  delivery_instructions?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  menu_item_id: string;
  menu_item: MenuItem;
  special_requests?: string;
  total_price: number;
}

export interface Customer {
  id: string;
  full_name: string;
  phone_number: string;
}

export interface Order {
  id: string;
  order_number: string;
  status: "ready" | "picked_up" | "in_transit" | "delivered";
  runner_id?: string;
  merchant_id: string;
  merchant: Merchant;
  customer_id: string;
  customer_addresses: CustomerAddress;
  order_items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: "cash" | "online";
  payment_status: "pending" | "paid";
  created_at: string;
  delivered_at?: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  status: string;
  changed_by: string;
  notes?: string;
  created_at: string;
}

export interface RunnerEarnings {
  id: string;
  runner_id: string;
  order_id: string;
  base_fee: number;
  tip_amount: number;
  bonus_amount: number;
  total_earned: number;
  payout_status: string;
  created_at: string;
}

// Generate mock data
export const merchants: Merchant[] = [
  { id: "1", name: "Campus Café", location: "Student Center", contact_phone: "011-234-5678" },
  { id: "2", name: "Wits Deli", location: "West Campus", contact_phone: "011-234-5679" },
  { id: "3", name: "Science Snacks", location: "Science Building", contact_phone: "011-234-5680" }
];

export const customers: Customer[] = [
  { id: "1", full_name: "Sarah Johnson", phone_number: "071-234-5678" },
  { id: "2", full_name: "Michael Smith", phone_number: "072-234-5678" },
  { id: "3", full_name: "Emily Davis", phone_number: "073-234-5678" }
];

export const customerAddresses: CustomerAddress[] = [
  { 
    id: "1", 
    building_name: "Student Residence A", 
    room_number: "205", 
    full_address: "123 Campus Drive", 
    delivery_instructions: "Please call when outside" 
  },
  { 
    id: "2", 
    building_name: "Engineering Building", 
    room_number: "302", 
    full_address: "456 Education Avenue" 
  },
  { 
    id: "3", 
    building_name: "Medical Sciences", 
    room_number: "110", 
    full_address: "789 Research Road", 
    delivery_instructions: "Leave at reception desk" 
  }
];

export const menuItems: MenuItem[] = [
  { id: "1", name: "Chicken Wrap", price: 55 },
  { id: "2", name: "Beef Burger", price: 65 },
  { id: "3", name: "Vegetable Salad", price: 45 },
  { id: "4", name: "Coffee", price: 25 },
  { id: "5", name: "Fresh Juice", price: 30 }
];

// Generate mock order items
const createOrderItems = (orderNumber: number): OrderItem[] => {
  switch (orderNumber % 3) {
    case 0:
      return [
        {
          id: `item1-${orderNumber}`,
          quantity: 2,
          menu_item_id: "1",
          menu_item: menuItems[0],
          total_price: menuItems[0].price * 2
        },
        {
          id: `item2-${orderNumber}`,
          quantity: 1,
          menu_item_id: "4",
          menu_item: menuItems[3],
          total_price: menuItems[3].price
        }
      ];
    case 1:
      return [
        {
          id: `item1-${orderNumber}`,
          quantity: 1,
          menu_item_id: "2",
          menu_item: menuItems[1],
          special_requests: "No pickles",
          total_price: menuItems[1].price
        },
        {
          id: `item2-${orderNumber}`,
          quantity: 1,
          menu_item_id: "5",
          menu_item: menuItems[4],
          total_price: menuItems[4].price
        }
      ];
    default:
      return [
        {
          id: `item1-${orderNumber}`,
          quantity: 1,
          menu_item_id: "3",
          menu_item: menuItems[2],
          total_price: menuItems[2].price
        }
      ];
  }
};

// Generate mock orders
export const generateMockOrders = (): Order[] => {
  const now = new Date();
  const orders: Order[] = [];
  
  // Generate 3 ready orders
  for (let i = 1; i <= 3; i++) {
    const orderItems = createOrderItems(i);
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const deliveryFee = 15;
    
    orders.push({
      id: `order-ready-${i}`,
      order_number: `R${10000 + i}`,
      status: "ready",
      merchant_id: merchants[i % 3].id,
      merchant: merchants[i % 3],
      customer_id: customers[i % 3].id,
      customer_addresses: customerAddresses[i % 3],
      order_items: orderItems,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: subtotal + deliveryFee,
      payment_method: i % 2 === 0 ? "online" : "cash",
      payment_status: i % 2 === 0 ? "paid" : "pending",
      created_at: format(subMinutes(now, i * 15), "yyyy-MM-dd'T'HH:mm:ss")
    });
  }
  
  // Generate 2 active orders (one picked up, one in transit)
  orders.push({
    id: "order-pickup-1",
    order_number: "R10004",
    status: "picked_up",
    runner_id: "1", // Current user ID
    merchant_id: merchants[0].id,
    merchant: merchants[0],
    customer_id: customers[1].id,
    customer_addresses: customerAddresses[1],
    order_items: createOrderItems(4),
    subtotal: 85,
    delivery_fee: 15,
    total_amount: 100,
    payment_method: "online",
    payment_status: "paid",
    created_at: format(subMinutes(now, 45), "yyyy-MM-dd'T'HH:mm:ss")
  });
  
  orders.push({
    id: "order-transit-1",
    order_number: "R10005",
    status: "in_transit",
    runner_id: "1", // Current user ID
    merchant_id: merchants[1].id,
    merchant: merchants[1],
    customer_id: customers[2].id,
    customer_addresses: customerAddresses[2],
    order_items: createOrderItems(5),
    subtotal: 65,
    delivery_fee: 15,
    total_amount: 80,
    payment_method: "cash",
    payment_status: "pending",
    created_at: format(subMinutes(now, 60), "yyyy-MM-dd'T'HH:mm:ss")
  });
  
  // Generate completed orders (delivered)
  for (let i = 1; i <= 5; i++) {
    const orderItems = createOrderItems(i + 5);
    const subtotal = orderItems.reduce((sum, item) => sum + item.total_price, 0);
    const deliveryFee = 15;
    
    orders.push({
      id: `order-delivered-${i}`,
      order_number: `R${10005 + i}`,
      status: "delivered",
      runner_id: "1", // Current user ID
      merchant_id: merchants[i % 3].id,
      merchant: merchants[i % 3],
      customer_id: customers[i % 3].id,
      customer_addresses: customerAddresses[i % 3],
      order_items: orderItems,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: subtotal + deliveryFee,
      payment_method: i % 2 === 0 ? "online" : "cash",
      payment_status: "paid",
      created_at: format(subDays(now, i), "yyyy-MM-dd'T'HH:mm:ss"),
      delivered_at: format(subDays(now, i), "yyyy-MM-dd'T'HH:mm:ss")
    });
  }
  
  return orders;
};

// Generate earnings data
export const generateEarningsData = (runnerId: string) => {
  const orders = generateMockOrders().filter(
    order => order.status === "delivered" && order.runner_id === runnerId
  );
  
  return orders.map(order => {
    const baseFee = 10; // Updated to match configuration
    const tipAmount = Math.random() > 0.5 ? Math.floor(Math.random() * 20) : 0;
    const bonusAmount = 0;
    const totalEarned = baseFee + tipAmount + bonusAmount;
    
    return {
      id: `earning-${order.id}`,
      runner_id: runnerId,
      order_id: order.id,
      base_fee: baseFee,
      tip_amount: tipAmount,
      bonus_amount: bonusAmount,
      total_earned: totalEarned,
      payout_status: "paid",
      created_at: order.delivered_at || order.created_at
    };
  });
};

// Calculate earnings summary
export const calculateEarningsSummary = (earnings: RunnerEarnings[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const todayEarnings = earnings.filter(
    earning => new Date(earning.created_at) >= today
  );
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const weeklyEarnings = earnings.filter(
    earning => new Date(earning.created_at) >= startOfWeek
  );
  
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyEarnings = earnings.filter(
    earning => new Date(earning.created_at) >= startOfMonth
  );
  
  return {
    today: {
      count: todayEarnings.length,
      amount: todayEarnings.reduce((sum, earning) => sum + earning.total_earned, 0)
    },
    weekly: {
      count: weeklyEarnings.length,
      amount: weeklyEarnings.reduce((sum, earning) => sum + earning.total_earned, 0)
    },
    monthly: {
      count: monthlyEarnings.length,
      amount: monthlyEarnings.reduce((sum, earning) => sum + earning.total_earned, 0)
    },
    total: {
      count: earnings.length,
      amount: earnings.reduce((sum, earning) => sum + earning.total_earned, 0)
    }
  };
};

// Format order data for display
export const formatOrderDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, "MMM d, yyyy h:mm a");
};
