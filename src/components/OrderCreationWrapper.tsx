
import React from 'react';
import { OrderCreationHandler } from './OrderCreationHandler';

interface OrderCreationWrapperProps {
  children: React.ReactNode;
}

export const OrderCreationWrapper: React.FC<OrderCreationWrapperProps> = ({ children }) => {
  const handleOrderCreated = (orderId: string) => {
    console.log('Order created successfully with email notification:', orderId);
  };

  return (
    <OrderCreationHandler onOrderCreated={handleOrderCreated}>
      {children}
    </OrderCreationHandler>
  );
};

export default OrderCreationWrapper;
