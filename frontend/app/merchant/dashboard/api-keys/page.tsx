'use client';

import { useState } from 'react';

export default function APIKeysPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateKey = () => {
    const newKey = `pk_test_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setApiKey(newKey);
    setShowKey(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Keys</h1>
        <p className="text-gray-600">Manage your terminal API keys for integration</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Current API Key */}
        {showKey && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Terminal API Key</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-gray-900 break-all">{apiKey}</code>
                <button
                  onClick={copyToClipboard}
                  className="ml-4 px-4 py-2 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors text-sm font-semibold whitespace-nowrap"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <p className="text-sm text-red-600 font-medium">
              ⚠️ Keep this key secure and never share it publicly
            </p>
          </div>
        )}

        {/* Generate Key Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generate New API Key</h2>
          <p className="text-gray-600 mb-6">
            Create a new terminal API key to connect your POS system or application to Protega CloudPay.
          </p>
          <button
            onClick={generateKey}
            className="px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold"
          >
            Generate API Key
          </button>
        </div>

        {/* Integration Instructions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Integration Instructions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">cURL Example</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-green-400">
                  {`curl -X POST https://api.protega.cloud/v1/pay \\
  -H "Authorization: Bearer ${apiKey || 'YOUR_API_KEY'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "fingerprint_hash": "fp_customer123",
    "amount": 29.99,
    "merchant_id": "merch_12345"
  }'`}
                </code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Python Example</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-green-400">
                  {`import requests

headers = {
    'Authorization': f'Bearer ${apiKey || 'YOUR_API_KEY'}',
    'Content-Type': 'application/json'
}

data = {
    'fingerprint_hash': 'fp_customer123',
    'amount': 29.99,
    'merchant_id': 'merch_12345'
}

response = requests.post(
    'https://api.protega.cloud/v1/pay',
    headers=headers,
    json=data
)
print(response.json())`}
                </code>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">JavaScript Example</h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <code className="text-sm text-green-400">
                  {`const response = await fetch('https://api.protega.cloud/v1/pay', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey || 'YOUR_API_KEY'}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fingerprint_hash: 'fp_customer123',
    amount: 29.99,
    merchant_id: 'merch_12345'
  })
});

const data = await response.json();
console.log(data);`}
                </code>
              </div>
            </div>
          </div>
        </div>

        {/* API Documentation Link */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">📚 Need More Help?</h3>
          <p className="text-sm text-blue-800 mb-4">
            Visit our comprehensive API documentation for detailed endpoints, authentication, and code examples.
          </p>
          <a
            href="/developers"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            View Full API Docs
          </a>
        </div>
      </div>
    </div>
  );
}

