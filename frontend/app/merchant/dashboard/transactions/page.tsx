'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface Transaction {
  transaction_id: string;
  customer_id: string;
  total: number;
  status: string;
  timestamp: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await api.getTransactions(0, 200);
        const txns = Array.isArray(data) ? data : [];
        setTransactions(
          txns.map((txn: any) => ({
            transaction_id: txn.transaction_id,
            customer_id: txn.customer_id,
            total: txn.total,
            status: txn.status,
            timestamp: txn.timestamp,
          }))
        );
      } catch (error) {
        console.error('Unable to load transactions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(txn => 
    filter === 'all' ? true : txn.status === filter
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const aValue = a[sortBy as keyof Transaction];
    const bValue = b[sortBy as keyof Transaction];
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Transactions</h1>
        <p className="text-gray-600">View and manage all your payment transactions</p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-6">
        <p className="text-sm text-blue-800">
          🔒 <strong>Privacy Protected:</strong> Customer personal information, fingerprint data, and payment methods are encrypted and not accessible to merchants. 
          Only transaction amounts, timestamps, and anonymous customer IDs are shown for business analytics.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Status Filter:</label>
          <div className="flex gap-2">
            {['all', 'completed', 'pending', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-[#3cb6ad] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('id')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Transaction ID
                  {sortBy === 'id' && <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th 
                  onClick={() => handleSort('customer')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Customer ID
                  {sortBy === 'customer' && <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th 
                  onClick={() => handleSort('amount')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Amount
                  {sortBy === 'amount' && <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th 
                  onClick={() => handleSort('status')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Status
                  {sortBy === 'status' && <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                </th>
                <th 
                  onClick={() => handleSort('timestamp')}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  Timestamp
                  {sortBy === 'timestamp' && <span className="ml-1">{sortOrder === 'asc' ? '▲' : '▼'}</span>}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedTransactions.map((txn) => (
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

      {/* Summary */}
      <div className="mt-6 bg-[#3cb6ad] rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Total Transactions</p>
            <p className="text-3xl font-bold">{sortedTransactions.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">Total Amount</p>
            <p className="text-3xl font-bold">
              {formatCurrency(sortedTransactions.reduce((sum, txn) => sum + txn.amount, 0))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

