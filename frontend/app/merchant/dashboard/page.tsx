'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface DashboardStats {
  total_transactions: number;
  revenue: number;
  protega_fees: number;
  customers: number;
  avg_transaction: number;
  fraud_attempts: number;
  approval_rate: number;
}

interface Transaction {
  transaction_id: string;
  customer_id: string;
  total: number;
  status: string;
  timestamp: string;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [inventoryCount, setInventoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, transactionsResponse, inventoryResponse] = await Promise.all([
          api.getMerchantStats(),
          api.getTransactions(0, 5),
          api.getInventory(),
        ]);

        setStats({
          total_transactions: statsResponse.total_transactions,
          revenue: statsResponse.revenue,
          protega_fees: statsResponse.protega_fees,
          customers: statsResponse.customers,
          avg_transaction: statsResponse.avg_transaction,
          fraud_attempts: statsResponse.fraud_attempts,
          approval_rate: statsResponse.approval_rate,
        });

        setRecentTransactions(
          (transactionsResponse || []).map((txn: any) => ({
            transaction_id: txn.transaction_id,
            customer_id: txn.customer_id,
            total: txn.total,
            status: txn.status,
            timestamp: txn.timestamp,
          }))
        );

        setInventoryCount(Array.isArray(inventoryResponse) ? inventoryResponse.length : 0);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3cb6ad]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your account.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">Total</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.total_transactions ?? 0}</p>
          <p className="text-sm text-gray-600">Transactions</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <span className="text-2xl">💵</span>
            </div>
            <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">Revenue</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats?.revenue || 0)}</p>
          <p className="text-sm text-gray-600">Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">Fees</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(stats?.protega_fees || 0)}</p>
          <p className="text-sm text-gray-600">Protega Fees</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">Active</span>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stats?.customers ?? 0}</p>
          <p className="text-sm text-gray-600">Customers</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Avg. Transaction</span>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.avg_transaction || 0)}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Fraud Attempts</span>
            <span className="text-2xl">🛡️</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.fraud_attempts ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600 font-medium">Approval Rate</span>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats?.approval_rate ?? 0}%</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* POS Terminal */}
        <div className="bg-gradient-to-br from-[#3cb6ad] to-[#2ea99f] rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">POS Terminal</h2>
              <p className="text-white/90">
                In-store point of sale system
              </p>
            </div>
            <a 
              href="/merchant/pos"
              className="px-6 py-3 bg-white text-[#3cb6ad] rounded-lg hover:bg-gray-100 transition-colors font-bold"
            >
              Open POS →
            </a>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur">
              <div className="text-sm opacity-80 mb-1">Barcode Scanner</div>
              <div className="text-xl font-bold">Inventory Link</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur">
              <div className="text-sm opacity-80 mb-1">Fingerprint Pay</div>
              <div className="text-xl font-bold">Instant</div>
            </div>
          </div>
        </div>

        {/* Inventory Management */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory</h2>
              <p className="text-gray-600">
                Manage products, prices & barcodes
              </p>
            </div>
            <a 
              href="/merchant/inventory"
              className="px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-bold"
            >
              Manage →
            </a>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Products</span>
              <span className="text-2xl font-bold text-gray-900">
                {inventoryCount}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Add products to enable barcode scanning in POS
              </p>
            </div>
          </div>
        </div>

        {/* Customer Terminal */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer Terminal</h2>
              <p className="text-gray-600">
                Open the customer-facing screen on a second monitor
              </p>
            </div>
            <a
              href="/customer/terminal"
              target="_blank"
              className="px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-bold"
            >
              Open →
            </a>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-gray-600">Direct link</div>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={typeof window !== 'undefined' ? `${window.location.origin}/customer/terminal` : '/customer/terminal'}
                className="flex-1 px-3 py-2 border rounded-lg text-sm text-gray-800 bg-gray-50"
              />
              <button
                onClick={() => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/customer/terminal` : '/customer/terminal';
                  navigator.clipboard?.writeText(url);
                }}
                className="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-black"
              >
                Copy
              </button>
              <button
                onClick={() => {
                  const url = typeof window !== 'undefined' ? `${window.location.origin}/customer/terminal` : '/customer/terminal';
                  window.open(url, '_blank', 'noopener');
                }}
                className="px-3 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
              >
                New Window
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-6">
        <p className="text-sm text-blue-800">
          🔒 <strong>Privacy Protected:</strong> Customer personal information, fingerprint data, and payment methods are encrypted and not accessible to merchants. 
          Only transaction amounts, timestamps, and anonymous customer IDs are shown for business analytics.
        </p>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            <a 
              href="/merchant/dashboard/transactions" 
              className="text-[#3cb6ad] hover:underline font-medium"
            >
              View all
            </a>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTransactions.map((txn) => (
                <tr key={txn.transaction_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{txn.transaction_id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{txn.customer_id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(txn.total)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(txn.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{formatDate(txn.timestamp)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

