'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState([
    {
      id: 'TXN-001',
      merchant: 'Coffee Shop',
      amount: 5.99,
      status: 'completed',
      timestamp: '2025-01-15 10:30 AM'
    },
    {
      id: 'TXN-002',
      merchant: 'Grocery Store',
      amount: 45.67,
      status: 'completed',
      timestamp: '2025-01-14 3:15 PM'
    },
    {
      id: 'TXN-003',
      merchant: 'Gas Station',
      amount: 35.00,
      status: 'completed',
      timestamp: '2025-01-14 9:00 AM'
    }
  ]);

  const [paymentAmount, setPaymentAmount] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [fingerprintScanning, setFingerprintScanning] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  
  // Load payment methods from customer profile
  const [paymentMethods] = useState([
    { id: 'checking', type: 'Checking', name: 'Chase Checking', last4: '4321', default: true },
    { id: 'credit', type: 'Credit Card', name: 'Visa **** 5678', last4: '5678', default: false },
    { id: 'savings', type: 'Savings', name: 'Chase Savings', last4: '9012', default: false }
  ]);

  const merchants = [
    'Coffee Shop',
    'Restaurant',
    'Grocery Store',
    'Gas Station',
    'Retail Store',
    'Bookstore'
  ];

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    if (!token) {
      router.push('/customer/register');
    }
    
    // Set default payment method
    const defaultMethod = paymentMethods.find(m => m.default);
    if (defaultMethod) {
      setSelectedPaymentMethod(defaultMethod.id);
    }
  }, [router, paymentMethods]);

  const handleFingerprintPay = async () => {
    if (!paymentAmount || !selectedMerchant || !selectedPaymentMethod) {
      alert('Please enter amount, select merchant, and choose payment method');
      return;
    }

    setFingerprintScanning(true);
    
    // Simulate fingerprint scan
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setFingerprintScanning(false);
    setPaymentProcessing(true);
    
    // Simulate payment processing with Stripe
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create new transaction with payment method info
    const paymentMethodInfo = paymentMethods.find(m => m.id === selectedPaymentMethod);
    const newTransaction = {
      id: `TXN-${Date.now()}`,
      merchant: selectedMerchant,
      amount: parseFloat(paymentAmount),
      status: 'completed',
      timestamp: new Date().toLocaleString(),
      paymentMethod: paymentMethodInfo?.name || ''
    };
    
    setTransactions([newTransaction, ...transactions]);
    
    // Reset form (keep payment method selected)
    setPaymentAmount('');
    setSelectedMerchant('');
    setPaymentProcessing(false);
    
    alert(`Payment successful! 💳✨\nPaid with ${paymentMethodInfo?.name}`);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wallet</h1>
            <p className="text-gray-600">Pay with your fingerprint at any merchant</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Payment Panel */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Quick Pay Card */}
              <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-[#3cb6ad]">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Make a Payment</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Merchant
                    </label>
                    <select
                      value={selectedMerchant}
                      onChange={(e) => setSelectedMerchant(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent"
                    >
                      <option value="">Choose a merchant...</option>
                      {merchants.map((merchant) => (
                        <option key={merchant} value={merchant}>
                          {merchant}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent text-lg font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={selectedPaymentMethod}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent"
                    >
                      {paymentMethods.map((method) => (
                        <option key={method.id} value={method.id}>
                          {method.name} {method.default ? '(Default)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleFingerprintPay}
                    disabled={fingerprintScanning || paymentProcessing || !paymentAmount || !selectedMerchant || !selectedPaymentMethod}
                    className="w-full px-6 py-4 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {fingerprintScanning ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Scanning Fingerprint...
                      </>
                    ) : paymentProcessing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <span className="text-2xl mr-3">👆</span>
                        Pay with Fingerprint
                      </>
                    )}
                  </button>
                </div>

                {fingerprintScanning && (
                  <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <p className="text-blue-800 text-center font-medium">
                      Place your finger on the scanner to authorize payment
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-[#3cb6ad] bg-opacity-10 rounded-full flex items-center justify-center">
                          <span className="text-2xl">💳</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{txn.merchant}</p>
                          <p className="text-sm text-gray-600">{txn.timestamp}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${txn.amount.toFixed(2)}</p>
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          {txn.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Account Summary */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Account Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Spent</span>
                    <span className="font-bold text-gray-900">
                      ${transactions.reduce((sum, txn) => sum + txn.amount, 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transactions</span>
                    <span className="font-bold text-gray-900">{transactions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Fingerprint Status */}
              <div className="bg-gradient-to-br from-[#3cb6ad] to-[#2ea99f] rounded-xl shadow-sm p-6 text-white">
                <h3 className="font-semibold mb-4">Fingerprint Status</h3>
                <div className="flex items-center mb-2">
                  <div className="text-4xl">👆</div>
                  <div className="ml-3">
                    <p className="font-semibold">Enrolled</p>
                    <p className="text-sm text-white/80">Ready to pay</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-xs text-white/80">
                    Your fingerprint is encrypted and secure
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link 
                    href="/customer/profile"
                    className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    📝 Edit Profile
                  </Link>
                  <Link 
                    href="/customer/payment-methods"
                    className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    💳 Payment Methods
                  </Link>
                  <Link 
                    href="/customer/bank"
                    className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    🏦 Manage Bank Accounts
                  </Link>
                  <Link 
                    href="/customer/history"
                    className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    📊 View History
                  </Link>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('customer_token');
                      router.push('/customer/register');
                    }}
                    className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

