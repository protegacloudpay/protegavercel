'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { api } from '@/lib/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function PaymentMethodsContent() {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [adding, setAdding] = useState(false);
  const [cardHolder, setCardHolder] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await api.getCurrentUser();
        if (user?.role !== 'customer') {
          router.push('/customer/login');
          return;
        }
        const methods = await api.getPaymentMethods();
        if (Array.isArray(methods)) {
          setPaymentMethods(methods);
        }
      } catch (e) {
        console.error('Failed to load payment methods', e);
        router.push('/customer/login');
      }
    };

    load();
  }, [router]);

  const refreshPaymentMethods = async () => {
    const methods = await api.getPaymentMethods();
    if (Array.isArray(methods)) {
      setPaymentMethods(methods);
    }
  };

  const handleAddNew = async () => {
    if (!stripe || !elements) {
      setError('Stripe is not ready yet. Please try again in a moment.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card input is not available');
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardHolder || undefined,
        },
      });

      if (stripeError || !paymentMethod) {
        throw new Error(stripeError?.message || 'Unable to create payment method');
      }

      await api.addPaymentMethod({
        type: paymentMethod.card?.funding === 'debit' ? 'debit_card' : 'credit_card',
        name: cardHolder || `${paymentMethod.card?.brand?.toUpperCase() || 'Card'} **** ${paymentMethod.card?.last4}`,
        last4: paymentMethod.card?.last4 || '',
        encrypted_data: paymentMethod.id,
        is_default: paymentMethods.length === 0,
      });

      await refreshPaymentMethods();
      setCardHolder('');
      cardElement.clear();
    } catch (e: any) {
      setError(e?.message || 'Unable to add payment method');
    } finally {
      setAdding(false);
    }
  };

  return (
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
                method.is_default ? 'border-[#3cb6ad]' : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    method.is_default ? 'bg-[#3cb6ad] bg-opacity-10' : 'bg-gray-100'
                  }`}>
                    <span className="text-2xl">
                      {method.type?.includes('card') ? '💳' : '🏦'}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">
                      {method.type} •••• {method.last4}
                    </p>
                  </div>
                  {method.is_default && (
                    <span className="px-3 py-1 bg-[#3cb6ad] text-white rounded-full text-xs font-semibold">
                      Default
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Add New Card</h3>
          <div className="space-y-4">
            <input
              placeholder="Name on card"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="px-3 py-2 border rounded-lg w-full"
            />
            <div className="px-3 py-2 border rounded-lg bg-white">
              <CardElement options={{ hidePostalCode: true }} />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAddNew}
                disabled={adding}
                className="px-5 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold disabled:opacity-60"
              >
                {adding ? 'Adding…' : 'Save Card'}
              </button>
              <a
                href="/customer/terminal"
                className="px-5 py-3 border rounded-lg hover:bg-gray-50"
              >
                Back to Terminal
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl border border-blue-100 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 How it Works</h3>
          <p className="text-sm text-blue-800">
            Add your card once and Protega CloudPay securely stores the Stripe payment token. When you verify with your fingerprint, you can choose any saved method to complete the payment instantly.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentMethodsPage() {
  if (!stripePromise) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-20">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-6 rounded-lg">
              Stripe publishable key is not configured. Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to enable card onboarding.
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Elements stripe={stripePromise}>
        <PaymentMethodsContent />
      </Elements>
      <Footer />
    </>
  );
}


