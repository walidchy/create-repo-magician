
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { PaymentForm } from '@/components/member/PaymentForm';

const Payment = () => {
  return (
    <MainLayout>
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Make a Payment</h1>
          <p className="text-muted-foreground">Enter your payment details to complete your transaction</p>
        </div>
        <PaymentForm />
      </div>
    </MainLayout>
  );
};

export default Payment;
