'use client';

import { useRouter } from 'next/navigation';

export default function POSIndexPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3cb6ad] to-[#2ea99f] flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl p-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Protega CloudPay™ POS System</h1>
          <p className="text-xl text-gray-600">Choose which interface to display</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => router.push('/merchant/pos')}
            className="bg-[#3cb6ad] text-white rounded-2xl p-8 hover:bg-[#2ea99f] transition-colors group"
          >
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-2xl font-bold mb-2">Merchant POS</h2>
            <p className="text-white/90">Build transactions and manage sales</p>
          </button>

          <button
            onClick={() => router.push('/customer/terminal')}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-8 hover:from-blue-600 hover:to-blue-700 transition-colors group"
          >
            <div className="text-6xl mb-4">👆</div>
            <h2 className="text-2xl font-bold mb-2">Customer Terminal</h2>
            <p className="text-white/90">Fingerprint payment interface</p>
          </button>
        </div>

        <div className="mt-8 bg-blue-50 rounded-xl p-6 text-center">
          <p className="text-sm text-blue-800">
            💡 Open both interfaces in separate browser windows or tabs to simulate real POS terminals
          </p>
        </div>
      </div>
    </div>
  );
}

