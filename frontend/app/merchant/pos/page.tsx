'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';

export default function MerchantPOSPage() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [items, setItems] = useState<Array<{name: string, price: number, barcode?: string}>>([]);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'waiting' | 'processing' | 'complete' | 'cancelled'>('idle');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string, amount?: number} | null>(null);
  const [inventory, setInventory] = useState<Array<{id: number, name: string, barcode: string, price: number}>>([]);
  const [currentTransactionData, setCurrentTransactionData] = useState<{amount: number, items: Array<{name: string, price: number}>, fingerprint_hash?: string} | null>(null);

  const resetTransaction = useCallback(() => {
    setItems([]);
    setAmount('');
    setBarcodeInput('');
    setTransactionStatus('idle');
    setCurrentTransactionData(null);
    localStorage.removeItem('pos_transaction_data');
    localStorage.setItem('pos_transaction_status', 'idle');
    localStorage.setItem('pos_transaction_trigger', Date.now().toString());
  }, []);

  const inventoryRef = useRef<Array<{id: number, name: string, barcode: string, price: number}>>([]);

  // Load inventory from API
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      router.push('/merchant/login');
      return;
    }

    api.setToken(token);

    const loadInventory = async () => {
      try {
        const items = await api.getInventory();
        if (Array.isArray(items)) {
          setInventory(items);
          inventoryRef.current = items;
        }
      } catch (error) {
        console.error('Failed to load inventory:', error);
      }
    };
    
    loadInventory();

    // Poll for inventory updates
    const interval = setInterval(() => {
      loadInventory();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [router]);

  useEffect(() => {
    // Listen for transaction updates from customer terminal
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pos_transaction_status') {
        const status = e.newValue as 'idle' | 'waiting' | 'processing' | 'complete' | 'cancelled';
        
        if (status === 'complete' && transactionStatus === 'waiting') {
          // Customer confirmed payment - create transaction via API
          handleTransactionComplete();
        } else if (status === 'cancelled') {
          setTransactionStatus('cancelled');
          setNotification({
            type: 'error',
            message: 'Transaction cancelled by customer'
          });
          setTimeout(() => {
            resetTransaction();
            setNotification(null);
          }, 3000);
        } else if (status === 'processing') {
          setTransactionStatus('processing');
        } else {
          setTransactionStatus(status);
        }
      }
    };

    // Also check for local updates (same tab)
    const checkStatus = () => {
      const status = localStorage.getItem('pos_transaction_status');
      if (status && status !== transactionStatus) {
        const statusValue = status as 'idle' | 'waiting' | 'processing' | 'complete' | 'cancelled';
        
        if (statusValue === 'complete' && transactionStatus === 'waiting') {
          handleTransactionComplete();
        } else if (statusValue === 'cancelled') {
          setTransactionStatus('cancelled');
          setNotification({
            type: 'error',
            message: 'Transaction cancelled by customer'
          });
          setTimeout(() => {
            resetTransaction();
            setNotification(null);
          }, 3000);
        } else if (statusValue === 'processing') {
          setTransactionStatus('processing');
        } else {
          setTransactionStatus(statusValue);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(checkStatus, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [transactionStatus, resetTransaction]);

  const handleTransactionComplete = async () => {
    // Get fingerprint hash from customer terminal
    const fingerprintHash = localStorage.getItem('fingerprint_cloud_id');
    
    if (!fingerprintHash || !currentTransactionData) {
      console.error('Missing fingerprint hash or transaction data');
      return;
    }

    try {
      // Create transaction via API
      const transactionData = await api.createTransaction({
        amount: currentTransactionData.amount,
        items: currentTransactionData.items,
        fingerprint_hash: fingerprintHash,
        payment_method_id: undefined // Customer terminal handles payment method selection
      });

      setTransactionStatus('complete');
      setNotification({
        type: 'success',
        message: 'Transaction successful!',
        amount: transactionData.total || currentTransactionData.amount * 1.08
      });

      setTimeout(() => {
        resetTransaction();
        setNotification(null);
      }, 4000);
    } catch (error: any) {
      console.error('Failed to create transaction:', error);
      setTransactionStatus('cancelled');
      setNotification({
        type: 'error',
        message: 'Transaction failed: ' + (error.message || 'Unknown error')
      });
      setTimeout(() => {
        resetTransaction();
        setNotification(null);
      }, 3000);
    }
  };

  const handleBarcodeScan = async (barcode: string) => {
    // Look up product by barcode from API
    try {
      const product = await api.getInventoryByBarcode(barcode);
      if (product && 'name' in product && 'price' in product) {
        const item = {
          name: product.name,
          price: product.price,
          barcode: product.barcode || barcode
        };
        setItems([...items, item]);
        setBarcodeInput('');
        return true;
      } else {
        alert(`Product not found in inventory for barcode: ${barcode}\n\nPlease add this product to your inventory first.`);
        setBarcodeInput('');
        return false;
      }
    } catch (error) {
      // Try local inventory as fallback
      const product = inventory.find(p => p.barcode === barcode);
      if (product) {
        const item = {
          name: product.name,
          price: product.price,
          barcode: product.barcode
        };
        setItems([...items, item]);
        setBarcodeInput('');
        return true;
      } else {
        alert(`Product not found in inventory for barcode: ${barcode}\n\nPlease add this product to your inventory first.`);
        setBarcodeInput('');
        return false;
      }
    }
  };

  const addItem = () => {
    if (!amount) return;
    const item = {
      name: `Item ${items.length + 1}`,
      price: parseFloat(amount)
    };
    setItems([...items, item]);
    setAmount('');
  };

  const handleBarcodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcodeInput(value);
  };

  const handleBarcodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcodeInput.trim()) {
      e.preventDefault();
      handleBarcodeScan(barcodeInput.trim());
    }
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const startTransaction = () => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    if (total <= 0) {
      alert('Please add items to the transaction');
      return;
    }
    
    setTransactionStatus('waiting');
    
    // Store transaction data for API call
    const transactionData = {
      amount: total,
      items: items,
      timestamp: Date.now()
    };
    setCurrentTransactionData(transactionData);
    
    // Broadcast to customer terminal via localStorage
    localStorage.setItem('pos_transaction_data', JSON.stringify(transactionData));
    localStorage.setItem('pos_transaction_status', 'waiting');
    localStorage.setItem('pos_transaction_trigger', Date.now().toString());
  };

  const cancelTransaction = () => {
    setTransactionStatus('cancelled');
    localStorage.setItem('pos_transaction_status', 'cancelled');
    localStorage.setItem('pos_transaction_trigger', Date.now().toString());
    
    setTimeout(() => {
      resetTransaction();
    }, 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const total = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      {notification && (
        <div className="fixed top-8 right-8 z-50 animate-fade-in">
          <div
            className={`rounded-2xl shadow-2xl p-6 min-w-[400px] border-2 transform transition-all animate-pulse ${
              notification.type === 'success'
                ? 'bg-green-600 border-green-500 text-white'
                : 'bg-red-600 border-red-500 text-white'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className="text-4xl">
                {notification.type === 'success' ? '✅' : '❌'}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">
                  {notification.type === 'success' ? 'Transaction Successful!' : 'Transaction Failed'}
                </h3>
                <p className="text-white/90 mb-2">{notification.message}</p>
                {notification.amount && (
                  <p className="text-2xl font-bold">
                    {formatCurrency(notification.amount)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Merchant POS Terminal</h1>
            <p className="text-gray-300">Protega CloudPay™ Point of Sale</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const url = typeof window !== 'undefined' ? `${window.location.origin}/customer/terminal` : '/customer/terminal';
                navigator.clipboard?.writeText(url);
              }}
              className="px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-colors text-sm"
            >
              Copy Customer URL
            </button>
            <a
              href="/customer/terminal"
              target="_blank"
              className="px-3 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-colors text-sm"
            >
              Open Customer Screen →
            </a>
            <Link
              href="/merchant/dashboard"
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Build Transaction</h2>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📷 Scan Barcode (from Inventory)
              </label>
              <input
                type="text"
                value={barcodeInput}
                onChange={handleBarcodeInputChange}
                onKeyPress={handleBarcodeKeyPress}
                placeholder="Scan barcode or type 13 digits..."
                className="w-full px-4 py-3 border-2 border-[#3cb6ad] rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent text-lg font-semibold bg-green-50"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">Scanner will auto-add product from inventory</p>
            </div>

            <div className="mb-6 border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Enter Amount Manually
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent text-lg font-semibold"
                />
                <button
                  onClick={addItem}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="border-2 border-gray-200 rounded-lg p-4 min-h-[300px] mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Items:</h3>
              {items.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No items added yet</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{item.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-gray-900">{formatCurrency(item.price)}</span>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {items.length > 0 && (
                <div className="mt-4 pt-4 border-t-2 border-gray-300 flex items-center justify-between">
                  <span className="text-xl font-bold text-gray-900">TOTAL:</span>
                  <span className="text-3xl font-bold text-[#3cb6ad]">{formatCurrency(total)}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={startTransaction}
                disabled={items.length === 0 || transactionStatus !== 'idle'}
                className="w-full px-6 py-4 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {transactionStatus === 'waiting' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Waiting for Customer...
                  </>
                ) : transactionStatus === 'processing' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                    Processing Payment...
                  </>
                ) : (
                  '💳 Start Transaction'
                )}
              </button>

              {transactionStatus !== 'idle' && (
                <button
                  onClick={cancelTransaction}
                  className="w-full px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Cancel Transaction
                </button>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl shadow-xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">Transaction Status</h2>
            
            <div className="flex flex-col items-center justify-center h-[400px]">
              {transactionStatus === 'idle' && (
                <>
                  <div className="text-8xl mb-4">🛒</div>
                  <p className="text-2xl font-semibold mb-2">Ready</p>
                  <p className="text-gray-400">Add items and start transaction</p>
                </>
              )}
              
              {transactionStatus === 'waiting' && (
                <>
                  <div className="text-8xl mb-4 animate-pulse">👆</div>
                  <p className="text-2xl font-semibold mb-2">Waiting for Fingerprint</p>
                  <p className="text-gray-400">Customer should scan fingerprint</p>
                </>
              )}
              
              {transactionStatus === 'processing' && (
                <>
                  <div className="w-24 h-24 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-2xl font-semibold mb-2">Processing Payment</p>
                  <p className="text-gray-400">Please wait...</p>
                </>
              )}
              
              {transactionStatus === 'complete' && (
                <>
                  <div className="text-8xl mb-4">✅</div>
                  <p className="text-2xl font-semibold mb-2">Payment Complete!</p>
                  <p className="text-gray-400">Transaction successful</p>
                </>
              )}
              
              {transactionStatus === 'cancelled' && (
                <>
                  <div className="text-8xl mb-4">❌</div>
                  <p className="text-2xl font-semibold mb-2">Transaction Cancelled</p>
                  <p className="text-gray-400">Ready for next customer</p>
                </>
              )}
            </div>

            {(transactionStatus === 'waiting' || transactionStatus === 'processing') && (
              <div className="mt-8 bg-white bg-opacity-10 rounded-lg p-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-xl font-bold">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Items:</span>
                  <span className="text-xl font-bold">{items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tax:</span>
                  <span className="text-xl font-bold">{formatCurrency(total * 0.08)}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-white border-opacity-20 flex justify-between">
                  <span className="text-2xl font-bold">Total:</span>
                  <span className="text-3xl font-bold text-[#3cb6ad]">{formatCurrency(total * 1.08)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
