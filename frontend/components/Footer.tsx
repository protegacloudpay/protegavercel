import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="text-xl font-bold text-[#3cb6ad] mb-4">Protega CloudPay™</div>
            <p className="text-sm text-gray-600">
              Pay with nothing but your fingerprint.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/#features" className="hover:text-[#3cb6ad]">Features</Link></li>
              <li><Link href="/#pricing" className="hover:text-[#3cb6ad]">Pricing</Link></li>
              <li><Link href="/developers" className="hover:text-[#3cb6ad]">API Docs</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/#about" className="hover:text-[#3cb6ad]">About</Link></li>
              <li><Link href="/contact" className="hover:text-[#3cb6ad]">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-[#3cb6ad]">Careers</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><Link href="/legal/privacy" className="hover:text-[#3cb6ad]">Privacy Policy</Link></li>
              <li><Link href="/legal/terms" className="hover:text-[#3cb6ad]">Terms of Service</Link></li>
              <li><Link href="/legal/bipa" className="hover:text-[#3cb6ad]">BIPA Compliance</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          © 2025 Protega CloudPay™ | Pay with nothing but your fingerprint.
        </div>
      </div>
    </footer>
  );
}




