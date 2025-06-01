
import React from 'react';
import { OrderCreationWrapper } from '@/components/OrderCreationWrapper';
import { OrderForm } from '@/components/OrderForm';
import { EmailNotificationStatus } from '@/components/EmailNotificationStatus';

const TestOrder: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Test Order with Email Notifications</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <OrderCreationWrapper>
            <OrderForm />
          </OrderCreationWrapper>
        </div>
        
        <div>
          <EmailNotificationStatus />
        </div>
      </div>
    </div>
  );
};

export default TestOrder;
