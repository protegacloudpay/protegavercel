'use client';

import { useState } from 'react';

export default function FingerprintsPage() {
  const [scanning, setScanning] = useState(false);
  const [fingerprintHash, setFingerprintHash] = useState('');
  const [enrolled, setEnrolled] = useState(false);
  const [bankLinked, setBankLinked] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<'idle' | 'scanning' | 'processing' | 'success'>('idle');

  const handleScan = async () => {
    setScanning(true);
    setEnrollmentStatus('scanning');
    
    // Simulate fingerprint scan
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate mock hash
    const hash = `fp_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    setFingerprintHash(hash);
    setEnrollmentStatus('processing');
    setScanning(false);
  };

  const handleLinkBank = async () => {
    setEnrollmentStatus('processing');
    
    // Simulate Plaid integration
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setBankLinked(true);
    setEnrollmentStatus('success');
  };

  const handleEnroll = async () => {
    if (!fingerprintHash) {
      alert('Please scan your fingerprint first');
      return;
    }
    
    if (!bankLinked) {
      alert('Please link your bank account first');
      return;
    }
    
    setEnrollmentStatus('processing');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setEnrolled(true);
    setEnrollmentStatus('success');
    
    alert('Fingerprint enrolled successfully!');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hardware Setup</h1>
        <p className="text-gray-600">Configure your fingerprint scanner hardware for customer enrollment</p>
      </div>

      {/* Privacy Notice */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-6">
        <p className="text-sm text-blue-800">
          🔒 <strong>Privacy Notice:</strong> This page is for configuring merchant hardware only. 
          Customer fingerprint data is encrypted and stored securely in the cloud. Merchants cannot access or view customer fingerprint information.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Enrollment Steps */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="space-y-8">
            {/* Step 1: Scan Fingerprint */}
            <div>
              <div className="flex items-start mb-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  fingerprintHash ? 'bg-[#3cb6ad] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan Fingerprint</h3>
                  <p className="text-gray-600 mb-4">
                    Place your finger on the biometric scanner to capture your unique fingerprint data.
                  </p>
                  {scanning && (
                    <div className="mb-4">
                      <div className="flex items-center justify-center py-8">
                        <div className="relative">
                          <div className="w-24 h-24 border-4 border-[#3cb6ad] border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl">👆</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-gray-600">Scanning fingerprint...</p>
                    </div>
                  )}
                  {fingerprintHash && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800 font-medium mb-2">✓ Fingerprint captured successfully</p>
                      <p className="text-xs font-mono text-green-700 break-all">{fingerprintHash}</p>
                    </div>
                  )}
                  {!scanning && !fingerprintHash && (
                    <button
                      onClick={handleScan}
                      className="px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold"
                    >
                      Scan Fingerprint
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Link Bank Account */}
            <div>
              <div className="flex items-start mb-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  bankLinked ? 'bg-[#3cb6ad] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Link Bank Account</h3>
                  <p className="text-gray-600 mb-4">
                    Securely connect your bank account through our Plaid integration for payment processing.
                  </p>
                  {bankLinked && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800 font-medium">✓ Bank account linked successfully</p>
                    </div>
                  )}
                  {!bankLinked && fingerprintHash && (
                    <button
                      onClick={handleLinkBank}
                      className="px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold"
                    >
                      Link Bank Account
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Step 3: Confirm & Save */}
            <div>
              <div className="flex items-start mb-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  enrolled ? 'bg-[#3cb6ad] text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm & Save</h3>
                  <p className="text-gray-600 mb-4">
                    Review your information and complete the enrollment process.
                  </p>
                  {enrolled && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4">
                      <p className="text-sm text-green-800 font-medium">✓ Enrollment completed successfully</p>
                    </div>
                  )}
                  {!enrolled && bankLinked && (
                    <button
                      onClick={handleEnroll}
                      className="px-6 py-3 bg-[#3cb6ad] text-white rounded-lg hover:bg-[#2ea99f] transition-colors font-semibold"
                    >
                      Confirm & Enroll
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-6">
          <h3 className="font-semibold text-blue-900 mb-2">🔒 Security & Compliance</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• All fingerprint data is encrypted using AES-256 encryption</li>
            <li>• Fingerprint hashes are stored securely and never exposed</li>
            <li>• Compliant with BIPA (Biometric Information Privacy Act)</li>
            <li>• GDPR-compliant data handling and processing</li>
            <li>• PCI-DSS Level 1 certified payment processing</li>
          </ul>
        </div>

        {/* SDK Integration Notice */}
        <div className="mt-6 bg-yellow-50 rounded-xl border border-yellow-100 p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">🔌 SDK Integration</h3>
          <p className="text-sm text-yellow-800">
            This is a placeholder UI for demonstration purposes. In production, integrate with your biometric SDK 
            (e.g., Fingerprint Devices Inc., HID, or custom hardware) through our secure API endpoints.
          </p>
        </div>
      </div>
    </div>
  );
}

