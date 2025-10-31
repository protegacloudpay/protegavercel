'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <p className="text-gray-600">Last updated: January 15, 2025</p>
            
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                Protega CloudPay™ ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our biometric payment platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect the following types of information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Biometric Data:</strong> Encrypted fingerprint data stored securely using AES-256 encryption</li>
                <li><strong>Personal Information:</strong> Name, email address, and contact details</li>
                <li><strong>Payment Information:</strong> Bank account details processed through Plaid</li>
                <li><strong>Transaction Data:</strong> Purchase history, amounts, and timestamps</li>
                <li><strong>Device Information:</strong> IP address, browser type, and device identifiers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Process biometric payment transactions</li>
                <li>Authenticate users and prevent fraud</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our services and develop new features</li>
                <li>Comply with legal obligations and regulatory requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-leading security measures including AES-256 encryption, secure API endpoints, 
                PCI-DSS Level 1 compliance, and regular security audits. Your biometric data is never stored in plain text 
                and is processed in compliance with BIPA and GDPR regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access your personal data</li>
                <li>Request correction or deletion of your data</li>
                <li>Withdraw consent for biometric data processing</li>
                <li>Export your transaction history</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                For privacy-related inquiries, please contact us at:
              </p>
              <p className="text-gray-700 font-medium mt-2">
                Email: privacy@protega.cloud<br />
                Address: Miami, Florida, United States
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

