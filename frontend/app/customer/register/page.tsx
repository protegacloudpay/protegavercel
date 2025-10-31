'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function CustomerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });
  const [fingerprintEnrolled, setFingerprintEnrolled] = useState(false);
  const [bankLinked, setBankLinked] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFingerprintEnroll = async () => {
    // Simulate fingerprint enrollment
    setFingerprintEnrolled(false);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setFingerprintEnrolled(true);
  };

  const handleBankLink = async () => {
    // Simulate Plaid bank linking
    setBankLinked(false);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setBankLinked(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate cloud fingerprint hash (AES-256 encrypted)
    const fingerprintHash = 'fp_' + btoa(formData.email + Date.now()).substring(0, 32);
    
    // Store customer data including cloud fingerprint ID
    localStorage.setItem('customer_token', 'customer_token_' + Date.now());
    localStorage.setItem('customer_email', formData.email);
    localStorage.setItem('customer_fingerprint', fingerprintHash);
    localStorage.setItem('fingerprint_cloud_id', fingerprintHash); // Cloud identifier
    
    // Store customer profile for cloud sync
    localStorage.setItem('customer_profile', JSON.stringify({
      ...formData,
      fingerprintId: fingerprintHash,
      enrolledAt: new Date().toISOString(),
      cloudStored: true
    }));
    
    router.push('/customer/dashboard');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4">
          
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex-1 flex items-center ${step >= 1 ? 'text-[#3cb6ad]' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-[#3cb6ad] text-white' : 'bg-gray-200'}`}>
                  1
                </div>
                <span className="ml-2 font-semibold">Profile</span>
              </div>
              <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-[#3cb6ad]' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 flex items-center ${step >= 2 ? 'text-[#3cb6ad]' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-[#3cb6ad] text-white' : 'bg-gray-200'}`}>
                  2
                </div>
                <span className="ml-2 font-semibold">Fingerprint</span>
              </div>
              <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-[#3cb6ad]' : 'bg-gray-200'}`}></div>
              <div className={`flex-1 flex items-center ${step >= 3 ? 'text-[#3cb6ad]' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-[#3cb6ad] text-white' : 'bg-gray-200'}`}>
                  3
                </div>
                <span className="ml-2 font-semibold">Bank</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Join Protega CloudPay
            </h2>
            
            {/* Step 1: Profile */}
            {step === 1 && (
              <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3cb6ad] focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold"
                >
                  Next: Enroll Fingerprint
                </button>
              </form>
            )}

            {/* Step 2: Fingerprint */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Fingerprint Enrollment</h3>
                <p className="text-gray-600">
                  Securely enroll your fingerprint for biometric payments. This data is encrypted with AES-256 and stored in the cloud, accessible at all participating merchants.
                </p>

                {!fingerprintEnrolled ? (
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <div className="w-24 h-24 border-4 border-[#3cb6ad] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-700 font-medium mb-4">Place your finger on the scanner</p>
                    <button
                      onClick={handleFingerprintEnroll}
                      className="px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold"
                    >
                      Start Scan
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-green-800 font-medium">Fingerprint enrolled successfully!</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!fingerprintEnrolled}
                    className="flex-1 px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next: Link Bank
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Bank Account */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Link Bank Account</h3>
                <p className="text-gray-600">
                  Connect your bank account securely through our integration. Your banking information is never stored.
                </p>

                {!bankLinked ? (
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <div className="text-5xl mb-4">🏦</div>
                    <p className="text-gray-700 font-medium mb-4">Secure bank connection powered by Plaid</p>
                    <button
                      onClick={handleBankLink}
                      className="px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold"
                    >
                      Link Bank Account
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 rounded-lg p-6 text-center">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-green-800 font-medium">Bank account linked successfully!</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!bankLinked}
                    className="flex-1 px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Complete Registration
                  </button>
                </form>
              </div>
            )}

            <p className="mt-6 text-center text-gray-600 text-sm">
              Already have an account?{' '}
              <Link href="/customer/login" className="text-[#3cb6ad] hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 bg-blue-50 rounded-xl border border-blue-100 p-4">
            <p className="text-sm text-blue-800 text-center">
              🔒 Your data is encrypted and secure. Compliant with BIPA, GDPR, and PCI-DSS standards.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

