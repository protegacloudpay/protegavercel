'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';

interface Transaction {
  transaction_id: string;
  merchant_id?: string;
  total: number;
  status: string;
  timestamp: string;
}

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await api.getCurrentUser();
        if (user?.role !== 'customer') {
          router.push('/customer/login');
          return;
        }

        const [txnResponse, methodsResponse] = await Promise.all([
          api.getTransactions(0, 20),
          api.getPaymentMethods(),
        ]);

        setTransactions(
          (txnResponse || []).map((txn: any) => ({
            transaction_id: txn.transaction_id,
            merchant_id: txn.payment_provider || txn.customer_id,
            total: txn.total,
            status: txn.status,
            timestamp: txn.timestamp,
          }))
        );

        if (Array.isArray(methodsResponse)) {
          setPaymentMethods(methodsResponse);
        }
      } catch (err: any) {
        setError(err?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const totalSpent = transactions.reduce((sum, txn) => sum + txn.total, 0);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Wallet</h1>
            <p className="text-gray-600">Secure biometric payments across all Protega merchants</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl shadow flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3cb6ad]"></div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-600">
                      No transactions yet. Visit a Protega merchant to make your first biometric payment.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {transactions.map((txn) => (
                        <div key={txn.transaction_id} className="py-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-[#3cb6ad] bg-opacity-10 rounded-full flex items-center justify-center">
                              <span className="text-2xl">💳</span>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{txn.transaction_id}</p>
                              <p className="text-sm text-gray-600">{new Date(txn.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-900">${txn.total.toFixed(2)}</p>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                              {txn.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Saved Payment Methods</h2>
                  {paymentMethods.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-gray-600 mb-4">You have not added any payment methods yet.</p>
                      <Link
                        href="/customer/payment-methods"
                        className="inline-block px-5 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors"
                      >
                        Add a Payment Method
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-3">
                          <div>
                            <p className="font-semibold text-gray-900">{method.name}</p>
                            <p className="text-sm text-gray-600">{method.type} •••• {method.last4}</p>
                          </div>
                          {method.is_default && (
                            <span className="px-3 py-1 bg-[#3cb6ad] text-white rounded-full text-xs font-semibold">Default</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Account Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Spent</span>
                      <span className="font-bold text-gray-900">${totalSpent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transactions</span>
                      <span className="font-bold text-gray-900">{transactions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Saved Cards</span>
                      <span className="font-bold text-gray-900">{paymentMethods.length}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#3cb6ad] to-[#2ea99f] rounded-xl shadow-sm p-6 text-white">
                  <h3 className="font-semibold mb-4">Fingerprint Ready</h3>
                  <p className="text-sm text-white/80">
                    Your fingerprint template is encrypted within the Protega Secure Enclave. You can pay at any participating merchant without sharing card details.
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Link href="/customer/profile" className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                      📝 Edit Profile
                    </Link>
                    <Link href="/customer/payment-methods" className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                      💳 Manage Payment Methods
                    </Link>
                    <Link href="/customer/terminal" className="block px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium">
                      🖥️ Open Customer Terminal
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

