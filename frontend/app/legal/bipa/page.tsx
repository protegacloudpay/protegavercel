'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BIPAPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">BIPA Compliance</h1>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Biometric Information Privacy Act</h2>
              <p className="text-gray-700 leading-relaxed">
                Protega CloudPay™ is fully compliant with the Illinois Biometric Information Privacy Act (BIPA) 
                and extends similar protections to all users regardless of location.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights Under BIPA</h2>
              <ul className="list-disc pl-6 space-y-3 text-gray-700">
                <li>
                  <strong>Written Disclosure:</strong> We inform you in writing about the collection, storage, 
                  and use of your biometric data before collection.
                </li>
                <li>
                  <strong>Consent:</strong> We obtain your written consent before collecting or storing biometric identifiers.
                </li>
                <li>
                  <strong>Retention Policy:</strong> We permanently destroy biometric data when it is no longer needed 
                  for the purpose for which it was collected or within 3 years, whichever comes first.
                </li>
                <li>
                  <strong>Disclosure:</strong> We do not disclose your biometric data without your consent unless required by law.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection Measures</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>AES-256 encryption for all biometric data</li>
                <li>Secure transmission via TLS 1.3</li>
                <li>Access controls and audit logging</li>
                <li>Regular security assessments and penetration testing</li>
                <li>Compliance with PCI-DSS Level 1 standards</li>
              </ul>
            </section>

            <section className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-3">Consent Form</h2>
              <p className="text-blue-800 mb-4">
                By enrolling in Protega CloudPay™, you acknowledge that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-blue-800">
                <li>You understand that we collect and store your biometric fingerprint data</li>
                <li>You consent to the use of your biometric data for payment authentication</li>
                <li>You have read and agree to our Privacy Policy and Terms of Service</li>
                <li>You understand your right to revoke consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions or Concerns?</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about our BIPA compliance or wish to revoke consent, please contact us:
              </p>
              <p className="text-gray-700 font-medium mt-2">
                Email: compliance@protega.cloud<br />
                Legal: legal@protega.cloud<br />
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

