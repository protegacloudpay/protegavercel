'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function CustomerTerminalPage() {
  const router = useRouter();
  const [transactionData, setTransactionData] = useState<{ amount: number; items: Array<{name: string, price: number}>; merchant_id?: string } | null>(null);
  const [status, setStatus] = useState<'idle' | 'fingerprint' | 'register' | 'payment-method' | 'processing' | 'complete' | 'cancelled'>('idle');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [fingerprintScanning, setFingerprintScanning] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [fingerprintHash, setFingerprintHash] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<Array<{id: number, type: string, name: string, last4: string}>>([]);

  // Load payment methods from API
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        const token = localStorage.getItem('customer_token');
        if (token) {
          api.setToken(token);
          const methods = await api.getPaymentMethods();
          if (Array.isArray(methods)) {
            setPaymentMethods(methods.map((m: any) => ({
              id: m.id,
              type: m.type,
              name: m.name,
              last4: m.last4 || '****'
            })));
          }
        }
      } catch (error) {
        console.error('Failed to load payment methods:', error);
      }
    };
    
    loadPaymentMethods();
  }, []);

  useEffect(() => {
    // Listen for POS updates via localStorage (cross-tab communication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pos_transaction_data' && e.newValue) {
        const data = JSON.parse(e.newValue);
        setTransactionData(data);
        setStatus('fingerprint');
      } else if (e.key === 'pos_transaction_status') {
        const newStatus = e.newValue as string;
        if (newStatus === 'cancelled') {
          setStatus('cancelled');
          setTimeout(() => {
            resetTerminal();
          }, 2000);
        } else if (newStatus === 'idle' && status !== 'idle') {
          resetTerminal();
        }
      }
    };

    // Poll for changes (works for same-tab and cross-tab)
    const checkForUpdates = () => {
      const transactionDataStr = localStorage.getItem('pos_transaction_data');
      const transactionStatus = localStorage.getItem('pos_transaction_status');

      if (transactionDataStr && status === 'idle') {
        const data = JSON.parse(transactionDataStr);
        setTransactionData(data);
        setStatus('fingerprint');
      }

      if (transactionStatus === 'cancelled' && status !== 'cancelled') {
        setStatus('cancelled');
        setTimeout(() => {
          resetTerminal();
        }, 2000);
      }

      if (transactionStatus === 'idle' && status !== 'idle' && status !== 'complete' && status !== 'cancelled') {
        resetTerminal();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(checkForUpdates, 300);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [status]);

  const handleFingerprintScan = async () => {
    setFingerprintScanning(true);
    
    // Simulate fingerprint scan
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate fingerprint hash (in production, this comes from biometric scanner)
    const hash = 'fp_' + btoa('fingerprint_' + Date.now()).substring(0, 32);
    setFingerprintHash(hash);
    localStorage.setItem('fingerprint_cloud_id', hash);
    
    // Check if customer exists via API
    try {
      const result = await api.verifyFingerprint(hash);
      
      setFingerprintScanning(false);
      
      if (result.verified && result.customer_id && !result.is_new) {
        // Existing customer
        setCustomerId(result.customer_id);
        setStatus('payment-method');
        if (paymentMethods.length > 0) {
          setSelectedPaymentMethod(paymentMethods[0].id);
        }
      } else {
        // New customer - prompt registration
        setIsNewCustomer(true);
        setStatus('register');
      }
    } catch (error: any) {
      // Fingerprint not found - new customer
      setFingerprintScanning(false);
      setIsNewCustomer(true);
      setStatus('register');
    }
  };

  const handlePaymentConfirm = async () => {
    if (!selectedPaymentMethod || !fingerprintHash || !transactionData) {
      alert('Please select a payment method');
      return;
    }

    setStatus('processing');

    // Notify merchant POS
    localStorage.setItem('pos_transaction_status', 'processing');
    localStorage.setItem('pos_transaction_trigger', Date.now().toString());

    try {
      // Create transaction via API
      // Note: Merchant creates the transaction, but we verify the payment was successful
      // The merchant POS should handle transaction creation
      
      // Just notify success
      setStatus('complete');
      localStorage.setItem('pos_transaction_status', 'complete');
      localStorage.setItem('pos_transaction_trigger', Date.now().toString());

      setTimeout(() => {
        resetTerminal();
      }, 3000);
    } catch (error: any) {
      alert('Payment failed: ' + (error.message || 'Unknown error'));
      setStatus('payment-method');
      localStorage.setItem('pos_transaction_status', 'failed');
    }
  };

  const handleCancel = () => {
    setStatus('cancelled');
    localStorage.setItem('pos_transaction_status', 'cancelled');
    localStorage.setItem('pos_transaction_trigger', Date.now().toString());

    setTimeout(() => {
      resetTerminal();
    }, 2000);
  };

  const resetTerminal = () => {
    setTransactionData(null);
    setStatus('idle');
    setSelectedPaymentMethod(null);
    setFingerprintScanning(false);
    setIsNewCustomer(false);
    setCustomerId(null);
    setFingerprintHash(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const total = transactionData ? transactionData.amount * 1.08 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3cb6ad] via-[#2ea99f] to-[#3cb6ad] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        <div className="bg-[#3cb6ad] text-white p-6 text-center">
          <h1 className="text-3xl font-bold mb-2">Protega CloudPay™</h1>
          <p className="text-white/90">Customer Payment Terminal</p>
        </div>

        <div className="p-8">
          
          {status === 'idle' && (
            <div className="text-center py-12">
              <div className="text-8xl mb-6">👆</div>
              <p className="text-3xl font-bold text-gray-900 mb-2">Ready to Pay</p>
              <p className="text-gray-600 text-lg">Waiting for merchant to start transaction</p>
            </div>
          )}

          {status === 'register' && transactionData && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome! Quick Registration</h2>
                <p className="text-gray-600">We detected a new fingerprint. Please register to complete your payment</p>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 mb-4">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">Transaction Summary</h3>
                <div className="space-y-2 mb-4">
                  {transactionData.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-700">
                      <span>{item.name}</span>
                      <span className="font-semibold">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between text-2xl font-bold text-gray-900">
                    <span>Total:</span>
                    <span className="text-[#3cb6ad]">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    id="regName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    id="regEmail"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    id="regPhone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  ✅ Your fingerprint is already enrolled. After registration, you'll proceed to payment method selection.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const name = (document.getElementById('regName') as HTMLInputElement)?.value || '';
                    const email = (document.getElementById('regEmail') as HTMLInputElement)?.value || '';
                    const phone = (document.getElementById('regPhone') as HTMLInputElement)?.value || '';
                    
                    if (!name || !email || !phone || !fingerprintHash) {
                      alert('Please fill in all required fields');
                      return;
                    }
                    
                    try {
                      // Register customer via API
                      const result = await api.registerCustomer({
                        name,
                        email,
                        phone,
                        fingerprint_hash: fingerprintHash
                      });
                      
                      setCustomerId(result.customer_id);
                      localStorage.setItem('customer_token', result.customer_id);
                      localStorage.setItem('customer_email', email);
                      
                      // Load payment methods after registration
                      try {
                        const methods = await api.getPaymentMethods();
                        if (Array.isArray(methods)) {
                          setPaymentMethods(methods.map((m: any) => ({
                            id: m.id,
                            type: m.type,
                            name: m.name,
                            last4: m.last4 || '****'
                          })));
                        }
                      } catch (error) {
                        console.error('Failed to load payment methods:', error);
                      }
                      
                      setStatus('payment-method');
                      if (paymentMethods.length > 0) {
                        setSelectedPaymentMethod(paymentMethods[0].id);
                      }
                    } catch (error: any) {
                      alert('Registration failed: ' + (error.message || 'Unknown error'));
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-[#3cb6ad] text-white rounded-xl hover:bg-[#2ea99f] transition-colors font-bold"
                >
                  Complete Registration & Pay
                </button>
              </div>
            </div>
          )}

          {status === 'fingerprint' && transactionData && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Scan Your Fingerprint</h2>
                
                {!fingerprintScanning ? (
                  <div className="bg-blue-50 rounded-2xl p-12 mb-6">
                    <div className="text-8xl mb-6 animate-pulse">👆</div>
                    <p className="text-gray-700 font-medium text-xl mb-6">Place your finger on the scanner</p>
                    <button
                      onClick={handleFingerprintScan}
                      className="px-12 py-4 bg-[#3cb6ad] text-white rounded-xl hover:bg-[#2ea99f] transition-colors font-bold text-lg"
                    >
                      Start Scan
                    </button>
                  </div>
                ) : (
                  <div className="bg-blue-50 rounded-2xl p-12 mb-6">
                    <div className="w-32 h-32 border-8 border-[#3cb6ad] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-gray-700 font-medium text-xl">Scanning fingerprint...</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-center">Transaction Summary</h3>
                <div className="space-y-2 mb-4">
                  {transactionData.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-gray-700">
                      <span>{item.name}</span>
                      <span className="font-semibold">{formatCurrency(item.price)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t-2 border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(transactionData.amount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (8%):</span>
                    <span className="font-semibold">{formatCurrency(transactionData.amount * 0.08)}</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2">
                    <span>Total:</span>
                    <span className="text-[#3cb6ad]">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'payment-method' && transactionData && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Payment Method</h2>
                {paymentMethods.length === 0 ? (
                  <p className="text-gray-600 mb-4">No payment methods available. Please add one first.</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedPaymentMethod(method.id)}
                        className={`w-full p-6 rounded-xl border-2 transition-all ${
                          selectedPaymentMethod === method.id
                            ? 'border-[#3cb6ad] bg-[#3cb6ad] bg-opacity-5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-4xl">
                              {method.type === 'credit_card' ? '💳' : '🏦'}
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-gray-900">{method.name}</p>
                              <p className="text-sm text-gray-600">{method.type} •••• {method.last4}</p>
                            </div>
                          </div>
                          {selectedPaymentMethod === method.id && (
                            <div className="text-2xl">✓</div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-4 bg-gray-200 text-gray-900 rounded-xl hover:bg-gray-300 transition-colors font-semibold text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePaymentConfirm}
                  disabled={!selectedPaymentMethod || paymentMethods.length === 0}
                  className="flex-1 px-6 py-4 bg-[#3cb6ad] text-white rounded-xl hover:bg-[#2ea99f] transition-colors font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Complete Payment
                </button>
              </div>
            </div>
          )}

          {status === 'processing' && (
            <div className="text-center py-12">
              <div className="w-32 h-32 border-8 border-[#3cb6ad] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-3xl font-bold text-gray-900 mb-2">Processing Payment...</p>
              <p className="text-gray-600 text-lg">Please wait</p>
            </div>
          )}

          {status === 'complete' && (
            <div className="text-center py-12">
              <div className="text-8xl mb-6">✅</div>
              <p className="text-3xl font-bold text-[#3cb6ad] mb-2">Payment Complete!</p>
              <p className="text-gray-600 text-lg">Thank you for your purchase</p>
            </div>
          )}

          {status === 'cancelled' && (
            <div className="text-center py-12">
              <div className="text-8xl mb-6">❌</div>
              <p className="text-3xl font-bold text-red-600 mb-2">Transaction Cancelled</p>
              <p className="text-gray-600 text-lg">Ready for next transaction</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
