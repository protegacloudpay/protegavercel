'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 'checking', type: 'Checking', name: 'Chase Checking', last4: '4321', default: true },
    { id: 'credit', type: 'Credit Card', name: 'Visa **** 5678', last4: '5678', default: false },
    { id: 'savings', type: 'Savings', name: 'Chase Savings', last4: '9012', default: false }
  ]);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      router.push('/customer/login');
    }
  }, [router]);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(pm => pm.map(m => ({ ...m, default: m.id === id })));
  };

  const handleAddNew = () => {
    // Simulate adding new payment method
    alert('Opening Plaid to add new payment method...');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Payment Methods</h1>
              <p className="text-gray-600">Manage your saved payment methods</p>
            </div>
            <Link
              href="/customer/dashboard"
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`bg-white rounded-xl shadow-sm border-2 p-6 transition-all ${
                  method.default ? 'border-[#3cb6ad]' : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      method.default ? 'bg-[#3cb6ad] bg-opacity-10' : 'bg-gray-100'
                    }`}>
                      <span className="text-2xl">
                        {method.type === 'Credit Card' ? '💳' : '🏦'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-600">
                        {method.type} •••• {method.last4}
                      </p>
                    </div>
                    {method.default && (
                      <span className="px-3 py-1 bg-[#3cb6ad] text-white rounded-full text-xs font-semibold">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!method.default && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <button
              onClick={handleAddNew}
              className="w-full px-6 py-4 border-2 border-dashed border-[#3cb6ad] text-[#3cb6ad] rounded-xl hover:bg-[#3cb6ad] hover:text-white transition-colors font-semibold flex items-center justify-center"
            >
              <span className="text-2xl mr-3">➕</span>
              Add New Payment Method
            </button>
          </div>

          <div className="mt-8 bg-blue-50 rounded-xl border border-blue-100 p-6">
            <h3 className="font-semibold text-blue-900 mb-2">💡 How it Works</h3>
            <p className="text-sm text-blue-800">
              Your fingerprint is linked to all your saved payment methods. When you pay with your fingerprint at any merchant, you can choose which payment method to use.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}


