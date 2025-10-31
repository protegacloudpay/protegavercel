'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <p className="text-gray-600">Last updated: January 15, 2025</p>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using Protega CloudPay™, you agree to be bound by these Terms of Service and all applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed">
                Protega CloudPay™ is a biometric payment platform that enables secure, device-free payments using fingerprint authentication.
                We provide payment processing services, merchant tools, and API access for integration with third-party systems.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Responsibilities</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide accurate and complete information during enrollment</li>
                <li>Maintain the security of your account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not use the service for fraudulent or illegal purposes</li>
                <li>Report any security breaches immediately</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Fees and Billing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Subscription fees and transaction fees are detailed in our pricing page. By subscribing, you agree to pay 
                all applicable fees. Fees are non-refundable unless otherwise stated.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Starter: $19/month + 0.25% + $0.05 per transaction</li>
                <li>Professional: $59/month + 0.20% + $0.05 per transaction</li>
                <li>Enterprise: $149/month + 0.15% + $0.04 per transaction</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                Protega CloudPay™ shall not be liable for any indirect, incidental, special, or consequential damages 
                arising from the use of our services. Our total liability shall not exceed the amount paid by you in the 
                twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Termination</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to terminate or suspend your account at any time for violation of these terms or 
                fraudulent activity. You may cancel your subscription at any time through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with the laws of the State of Florida, 
                United States, without regard to its conflict of law provisions.
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

