'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DevelopersPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">API Documentation</h1>
            <p className="text-xl text-gray-600">
              Integrate Protega CloudPay into your application with our comprehensive API
            </p>
          </div>

          {/* Quick Start */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Start</h2>
            <p className="text-gray-600 mb-6">
              Get started with Protega CloudPay API in minutes. Use your API key to authenticate requests.
            </p>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <code className="text-sm text-green-400">
                {`curl -X POST https://api.protega.cloud/v1/enroll \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "fingerprint_hash": "fp_abc123..."
  }'`}
              </code>
            </div>
          </div>

          {/* Endpoints */}
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-semibold mr-4">
                  POST
                </span>
                <h2 className="text-2xl font-bold text-gray-900">/v1/enroll</h2>
              </div>
              <p className="text-gray-600 mb-6">Register a new customer's fingerprint and link to bank account.</p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Request Body</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="text-sm text-gray-800">{`{
  "customer_name": "string",
  "customer_email": "string",
  "fingerprint_hash": "string",
  "bank_token": "string"
}`}</pre>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">Response</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800">{`{
  "customer_id": "CUST-001",
  "status": "enrolled",
  "message": "Customer enrolled successfully"
}`}</pre>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm font-semibold mr-4">
                  POST
                </span>
                <h2 className="text-2xl font-bold text-gray-900">/v1/pay</h2>
              </div>
              <p className="text-gray-600 mb-6">Process a fingerprint payment transaction.</p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Request Body</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="text-sm text-gray-800">{`{
  "fingerprint_hash": "string",
  "amount": 29.99,
  "merchant_id": "string"
}`}</pre>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">Response</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800">{`{
  "transaction_id": "TXN-001",
  "status": "completed",
  "amount": 29.99,
  "timestamp": "2025-01-15T10:30:00Z"
}`}</pre>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-semibold mr-4">
                  GET
                </span>
                <h2 className="text-2xl font-bold text-gray-900">/v1/transactions</h2>
              </div>
              <p className="text-gray-600 mb-6">Fetch transaction history for a merchant.</p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Query Parameters</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="text-sm text-gray-800">{`?merchant_id=merch_123
&status=completed
&start_date=2025-01-01
&end_date=2025-01-31`}</pre>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center mb-4">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded text-sm font-semibold mr-4">
                  POST
                </span>
                <h2 className="text-2xl font-bold text-gray-900">/v1/verify</h2>
              </div>
              <p className="text-gray-600 mb-6">Verify a fingerprint hash against enrolled customers.</p>
              
              <h3 className="font-semibold text-gray-900 mb-2">Request Body</h3>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="text-sm text-gray-800">{`{
  "fingerprint_hash": "fp_abc123..."
}`}</pre>
              </div>

              <h3 className="font-semibold text-gray-900 mb-2">Response</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-800">{`{
  "verified": true,
  "customer_id": "CUST-001"
}`}</pre>
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
            <p className="text-gray-600 mb-4">
              All API requests require authentication using a Bearer token in the Authorization header.
            </p>
            <div className="bg-gray-900 rounded-lg p-4">
              <code className="text-sm text-green-400">
                Authorization: Bearer YOUR_API_KEY
              </code>
            </div>
          </div>

          {/* Rate Limits */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limits</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-semibold">Starter</p>
                <p className="text-2xl font-bold text-gray-900">100</p>
                <p className="text-sm text-gray-600">requests/min</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-semibold">Professional</p>
                <p className="text-2xl font-bold text-gray-900">500</p>
                <p className="text-sm text-gray-600">requests/min</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-semibold">Enterprise</p>
                <p className="text-2xl font-bold text-gray-900">Unlimited</p>
                <p className="text-sm text-gray-600">requests/min</p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-[#3cb6ad] rounded-xl shadow-sm p-8 mt-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="mb-6 opacity-90">
              Our team is here to assist with integration, troubleshooting, and best practices.
            </p>
            <a
              href="/contact"
              className="inline-block px-6 py-3 bg-white text-[#3cb6ad] rounded-lg hover:bg-gray-100 transition-colors font-semibold"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

