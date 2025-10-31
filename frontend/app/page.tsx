'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Pay with nothing but your fingerprint.
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Revolutionary biometric payment infrastructure. Secure, device-free payments powered by advanced fingerprint technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link 
                href="/customer/register"
                className="px-8 py-4 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                I'm a Customer
              </Link>
              <Link 
                href="/merchant/login"
                className="px-8 py-4 border-2 border-[#3cb6ad] text-[#3cb6ad] rounded-lg hover:bg-[#3cb6ad] hover:text-white transition-colors font-semibold text-lg"
              >
                I'm a Merchant
              </Link>
            </div>
            <div className="flex justify-center">
              <Link 
                href="/developers"
                className="text-[#3cb6ad] hover:underline font-medium"
              >
                View API Docs →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 bg-[#3cb6ad] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enroll Your Fingerprint</h3>
              <p className="text-gray-600">
                Securely scan your fingerprint using our biometric scanner. Your data is encrypted with AES-256 and stored safely.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#3cb6ad] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Link Your Bank Account</h3>
              <p className="text-gray-600">
                Connect your bank account through our Plaid integration. All transactions are processed securely with PCI-DSS compliance.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-[#3cb6ad] rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pay Instantly</h3>
              <p className="text-gray-600">
                Simply touch the scanner at any participating merchant. No phone, wallet, or card needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Protega CloudPay Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Why Protega CloudPay?</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Device-Free Security</h3>
              <p className="text-gray-600">
                Your fingerprint is the only authentication you need. No lost wallets, stolen cards, or compromised passwords.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Universal Access</h3>
              <p className="text-gray-600">
                Works with any payment terminal. Integrates seamlessly with Stripe, Visa, AWS, and Plaid infrastructure.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Fraud Protection</h3>
              <p className="text-gray-600">
                Advanced machine learning algorithms detect and prevent fraud in real-time, with 99.9% accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">Custom Implementation</h2>
          <p className="text-center text-gray-600 mb-12 text-xl">
            Integrate biometric payments into your business with custom solutions
          </p>
          
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-br from-[#3cb6ad] to-[#2ea99f] rounded-2xl shadow-xl p-12 text-white">
              <div className="text-center mb-8">
                <div className="text-6xl mb-4">🤝</div>
                <h3 className="text-3xl font-bold mb-4">Enterprise Solutions</h3>
                <p className="text-lg opacity-90">
                  Get a custom quote tailored to your business needs
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur">
                  <div className="text-3xl mb-3">🔧</div>
                  <h4 className="font-semibold mb-2">Custom Integration</h4>
                  <p className="text-sm opacity-80">
                    Work with our team to build the perfect solution
                  </p>
                </div>

                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur">
                  <div className="text-3xl mb-3">📊</div>
                  <h4 className="font-semibold mb-2">Dedicated Support</h4>
                  <p className="text-sm opacity-80">
                    Priority support and dedicated account management
                  </p>
                </div>

                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur">
                  <div className="text-3xl mb-3">🛡️</div>
                  <h4 className="font-semibold mb-2">Security & Compliance</h4>
                  <p className="text-sm opacity-80">
                    Enterprise-grade security with full compliance
                  </p>
                </div>

                <div className="bg-white bg-opacity-10 rounded-xl p-6 backdrop-blur">
                  <div className="text-3xl mb-3">📈</div>
                  <h4 className="font-semibold mb-2">Scalable Infrastructure</h4>
                  <p className="text-sm opacity-80">
                    Built to scale with your business growth
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link 
                  href="/contact"
                  className="inline-block px-8 py-4 bg-white text-[#3cb6ad] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
                >
                  Request a Custom Quote
                </Link>
                <p className="text-sm opacity-80 mt-4">
                  Contact sales for pricing and implementation details
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Powered by Industry Leaders</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center opacity-60">
            <div className="text-3xl font-bold text-gray-700">Stripe</div>
            <div className="text-3xl font-bold text-blue-600">Visa</div>
            <div className="text-3xl font-bold text-orange-500">AWS</div>
            <div className="text-3xl font-bold text-purple-600">Plaid</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-[#3cb6ad] to-[#2ea99f]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Payment Security?</h2>
          <p className="text-xl text-white/90 mb-8">
            Join the pilot program and experience the future of biometric payments.
          </p>
          <Link 
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-[#3cb6ad] rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg shadow-lg"
          >
            Get Started Free
          </Link>
        </div>
      </section>

      <Footer />
    </>
  );
}
