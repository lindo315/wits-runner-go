
import React from 'react';
import { useOrderCancellationNotifications } from '@/hooks/useOrderCancellationNotifications';

interface OrderCancellationNotifierProps {
  children: React.ReactNode;
}

export const OrderCancellationNotifier: React.FC<OrderCancellationNotifierProps> = ({ 
  children 
}) => {
  useOrderCancellationNotifications();
  
  return <>{children}</>;
};

export default OrderCancellationNotifier;
